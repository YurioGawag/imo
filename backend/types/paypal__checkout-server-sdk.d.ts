declare module '@paypal/checkout-server-sdk' {
  export namespace subscriptions {
    class SubscriptionCreateRequest {
      constructor();
      requestBody(body: Record<string, unknown>): this;
    }

    class SubscriptionReviseRequest {
      constructor(subscriptionId: string);
      requestBody(body: Record<string, unknown>): this;
    }
  }

  export namespace core {
    class PayPalHttpClient {
      constructor(env: SandboxEnvironment | LiveEnvironment);
      execute(req: unknown): Promise<any>;
    }
    class SandboxEnvironment {
      constructor(clientId: string, clientSecret: string);
    }
    class LiveEnvironment {
      constructor(clientId: string, clientSecret: string);
    }
  }

  export interface LinkDescription {
    href: string;
    rel: string;
    method?: string;
  }
}

