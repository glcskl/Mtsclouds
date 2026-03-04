import Dockerode from 'dockerode';

export interface VMSpec {
  vmId: string;
  name: string;
  image: string;
  cpu: number;
  ramGb: number;
  tenantId: string;
  vdcId: string;
  templateId: string;
}

export interface VMStats {
  cpuPercent: number;
  ramUsedMb: number;
  ramLimitMb: number;
}

export interface ComputeProvider {
  createVm(spec: VMSpec): Promise<{ providerRef: string; ip: string; port?: number }>;
  start(providerRef: string): Promise<void>;
  stop(providerRef: string): Promise<void>;
  remove(providerRef: string): Promise<void>;
  stats(providerRef: string): Promise<VMStats>;
}

// ─── Mock Provider ─────────────────────────────────────────────────
export class MockProvider implements ComputeProvider {
  private counter = 1000;

  async createVm(spec: VMSpec) {
    const ref = `mock-${spec.vmId}-${this.counter++}`;
    const octet = Math.floor(Math.random() * 200) + 10;
    return { providerRef: ref, ip: `10.0.1.${octet}`, port: 10000 + this.counter };
  }

  async start(_ref: string) {}
  async stop(_ref: string) {}
  async remove(_ref: string) {}

  async stats(_ref: string): Promise<VMStats> {
    return {
      cpuPercent: Math.round(Math.random() * 80 + 5),
      ramUsedMb: Math.round(Math.random() * 1500 + 200),
      ramLimitMb: 4096,
    };
  }
}

// ─── Docker Provider ───────────────────────────────────────────────
export class DockerProvider implements ComputeProvider {
  private docker: Dockerode;

  constructor() {
    this.docker = new Dockerode({ socketPath: '/var/run/docker.sock' });
  }

  async createVm(spec: VMSpec) {
    // Pull image (ignore if already exists)
    try {
      await new Promise<void>((resolve, reject) => {
        this.docker.pull(spec.image, {}, (err: any, stream: any) => {
          if (err) return reject(err);
          this.docker.modem.followProgress(stream, (err2: any) => {
            if (err2) return reject(err2);
            resolve();
          });
        });
      });
    } catch {
      // Image might already exist locally
    }

    const container = await this.docker.createContainer({
      Image: spec.image,
      name: `mts-${spec.tenantId}-${spec.name}`.replace(/[^a-zA-Z0-9_.-]/g, '-'),
      Labels: {
        'mts.tenantId': spec.tenantId,
        'mts.vdcId': spec.vdcId,
        'mts.vmId': spec.vmId,
        'mts.template': spec.templateId,
        'mts.managed': 'true',
      },
      HostConfig: {
        CpuCount: spec.cpu,
        Memory: spec.ramGb * 1024 * 1024 * 1024,
        PublishAllPorts: true,
      },
    });

    await container.start();

    const info = await container.inspect();
    const ports = info.NetworkSettings?.Ports || {};
    const firstPort = Object.values(ports).flat().find((p: any) => p?.HostPort);
    const ip = info.NetworkSettings?.IPAddress || '172.17.0.2';

    return {
      providerRef: container.id,
      ip,
      port: firstPort ? parseInt((firstPort as any).HostPort) : undefined,
    };
  }

  async start(providerRef: string) {
    const c = this.docker.getContainer(providerRef);
    await c.start();
  }

  async stop(providerRef: string) {
    const c = this.docker.getContainer(providerRef);
    await c.stop();
  }

  async remove(providerRef: string) {
    const c = this.docker.getContainer(providerRef);
    try { await c.stop(); } catch { /* may already be stopped */ }
    await c.remove({ force: true });
  }

  async stats(providerRef: string): Promise<VMStats> {
    const c = this.docker.getContainer(providerRef);
    const s = await c.stats({ stream: false }) as any;

    const cpuDelta = s.cpu_stats.cpu_usage.total_usage - (s.precpu_stats?.cpu_usage?.total_usage || 0);
    const systemDelta = s.cpu_stats.system_cpu_usage - (s.precpu_stats?.system_cpu_usage || 0);
    const cpuPercent = systemDelta > 0 ? (cpuDelta / systemDelta) * (s.cpu_stats.online_cpus || 1) * 100 : 0;

    return {
      cpuPercent: Math.round(cpuPercent * 10) / 10,
      ramUsedMb: Math.round((s.memory_stats?.usage || 0) / 1024 / 1024),
      ramLimitMb: Math.round((s.memory_stats?.limit || 0) / 1024 / 1024),
    };
  }
}

// ─── Provider Factory ──────────────────────────────────────────────
let _provider: ComputeProvider | null = null;

export function getProvider(): ComputeProvider {
  if (_provider) return _provider;

  if (process.env.PROVIDER === 'docker') {
    try {
      _provider = new DockerProvider();
      console.log('[provider] Using DockerProvider');
    } catch (e) {
      console.warn('[provider] Docker not available, falling back to MockProvider');
      _provider = new MockProvider();
    }
  } else {
    _provider = new MockProvider();
    console.log('[provider] Using MockProvider');
  }

  return _provider;
}
