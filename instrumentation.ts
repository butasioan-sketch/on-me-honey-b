export async function register() {
  // Sentry integration - disabled until @sentry/nextjs is installed
  // To enable: Install package and rename .disabled files to .ts
  // console.log('Sentry not configured - continuing without error monitoring');
}

export const onRequestError = async (
  err: Error,
  request: {
    path: string; // resource path, e.g. /blog?name=foo
  },
  context: {
    routerKind: 'Pages Router' | 'App Router'; // the router type
    routePath: string; // the route file path, e.g. /app/blog/[dynamic]
    routeType: 'render' | 'route' | 'action' | 'middleware'; // the context in which the error occurred
    renderSource:
      | 'react-server-components'
      | 'react-server-components-payload'
      | 'server-rendering';
    revalidateReason: 'on-demand' | 'stale' | undefined; // undefined is a normal request without revalidation
    renderType: 'dynamic' | 'dynamic-resume'; // 'dynamic-resume' for PPR
  },
) => {
  // Sentry integration disabled - log to console
  console.error('Request error:', err, { request: request.path, ...context });
};
