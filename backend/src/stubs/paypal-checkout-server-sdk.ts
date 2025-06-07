export namespace subscriptions {
  export class SubscriptionCreateRequest {
    private body: Record<string, unknown> = {};
    requestBody(body: Record<string, unknown>): this {
      this.body = body;
      return this;
    }
  }
  export class SubscriptionReviseRequest {
    constructor(private subscriptionId: string) {}
    private body: Record<string, unknown> = {};
    requestBody(body: Record<string, unknown>): this {
      this.body = body;
      return this;
    }
  }
}

export namespace core {
  export class SandboxEnvironment {
    constructor(public clientId: string, public clientSecret: string) {}
  }
  export class LiveEnvironment {
    constructor(public clientId: string, public clientSecret: string) {}
  }
  export class PayPalHttpClient {
    constructor(public env: SandboxEnvironment | LiveEnvironment) {}
    async execute(_req: unknown): Promise<any> {
      throw new Error('PayPal SDK stub cannot execute requests');
    }
  }
}

export interface LinkDescription {
  href: string;
  rel: string;
  method?: string;
}
