#!/usr/bin/env python
from aiohttp import web
import asyncio

routes = web.RouteTableDef()

@routes.get("/{path:.*}")
async def serve(request):
  path = request.path
  path = path.split('/')
  cache_control = []
  delay = None
  while len(path) > 1:
    if path[0] == "no-store":
      cache_control.append("no-store")
    if path[0] == "no-cache":
      cache_control.append("no-cache")
    delay_prefix = "delay="
    if path[0].startswith(delay_prefix):
      try:
        delay = int(path[0].lstrip(delay_prefix))
      except:
        pass
    path = path[1:]
  path = path[0]
  if path == "":
    path = "index.html"
  resp = web.FileResponse("./static/" + path)
  if cache_control:
    resp.headers["Cache-Control"] = ", ".join(cache_control)
  if delay is not None:
    await asyncio.sleep(delay / 1000.)
  return resp

app = web.Application()
app.add_routes(routes)
if __name__ == "__main__":
  web.run_app(app, port=8000)

