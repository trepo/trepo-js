#!/usr/bin/env node

const apolloServer = require('apollo-server');
const Koa = require('koa');
const Router = require('koa-router');
const cors = require('kcors');
const Trepo = require('trepo-core');
const bodyParser = require('koa-bodyparser');
const {version} = require('../package.json');

const app = new Koa();
const router = new Router();
const port = process.env.PORT || 8985;

const trepo = new Trepo('_temp');

router.get('/', async ctx => {
  ctx.body = {
    version: version,
  };
});

router.post('/graphql', async ctx => {
  const response = await trepo.request({
    query: ctx.request.body.query,
    variables: JSON.parse(ctx.request.body.variables || '{}'),
    operationName: ctx.request.body.operationName,
  });
  ctx.body = response;
});

router.get('/graphiql',
  apolloServer.graphiqlKoa({endpointURL: '/graphql'}));

app
  .use(cors())
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

trepo.start()
  .then(() => {
    app.listen(port);
  })
  .catch(error => {
    console.error(error);
  });
