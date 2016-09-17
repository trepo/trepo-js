const Koa = require('koa');
const Router = require('koa-router');
const Trepo = require('trepo');
const bodyParser = require('koa-bodyparser');
const {version} = require('../package.json');

const app = new Koa();
const router = new Router();
const port = process.env.PORT || 8080;

const trepo = new Trepo();

router.get('/', async ctx => {
  ctx.body = {
    version: version,
  };
});

router.post('/graphql', async ctx => {
  const response = await trepo.request(
    ctx.request.body.query,
    ctx.request.body.variables,
    ctx.request.body.requestName,
  );
  ctx.body = response;
});

router.get('/graphiql',
  trepo.apolloServer.graphiqlKoa({endpointURL: '/graphql'}));

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(port);
