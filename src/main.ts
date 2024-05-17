import { createServer, request } from "http";
import { config } from "./config.js";
import { routes } from "./routes.js";

createServer((req, res) => {
  const requestMethod = req.method as string;
  const host = req.headers.host ?? config.HOST;
  const url = new URL(req.url as string, "http://" + host);

  res.setHeader("access-control-allow-origin", "*");

  const matchedRoute = routes.find((route) =>
    route.matcher({ method: requestMethod, pathname: url.pathname }),
  );

  if (!matchedRoute) {
    res.writeHead(404).end();
    return;
  }

  const searchParamsObject = Object.fromEntries(url.searchParams);
  const targetUrl = matchedRoute.handler({
    req,
    pathname: url.pathname,
    searchParamsObject,
  });
  if (!targetUrl) {
    res.writeHead(400).end();
    return;
  }

  const proxiedRequest = request(
    targetUrl,
    {
      method: requestMethod,
      headers: { authorization: "Bearer " + config.API_TOKEN },
    },
    (proxiedResponse) => {
      res.writeHead(
        proxiedResponse.statusCode as number,
        proxiedResponse.headers,
      );
      proxiedResponse.pipe(res);
    },
  );

  req.pipe(proxiedRequest);
}).listen(config.PORT);
