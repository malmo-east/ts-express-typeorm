import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { GraphQLSchema } from 'graphql';
import helmet from 'helmet';
import { injectable } from 'inversify';
import morgan from 'morgan';
import { AppRouter } from './app.router.js';
import { GraphQLContext } from './config/context.js';
import { errorHandler, gqlErrorHandler, gqlFormatError } from './lib/error.handlers.js';
import { logger } from './lib/logger.js';

@injectable()
export class App {
  readonly server: express.Express = express();

  constructor(private router: AppRouter, private schema: GraphQLSchema) {}

  async init() {
    const {
      server,
      router: { routes },
      schema,
    } = this;

    const env = server.get('env');
    logger.info(`environment: ${env}`);

    server.use(helmet());
    server.use(
      env === 'production'
        ? morgan('combined', {
            stream: {
              write(message: string): void {
                logger.info(message);
              },
            },
          })
        : morgan('dev'),
    );
    server.use(cors({ exposedHeaders: ['Content-Disposition'] }));

    server.use(express.json());
    server.use(express.urlencoded({ extended: false }));
    server.use(compression());

    server.use(routes);
    server.use(errorHandler);

    const apollo = new ApolloServer<GraphQLContext>({
      schema,
      formatError: gqlFormatError,
      plugins: [
        {
          requestDidStart: () => {
            return Promise.resolve({ didEncounterErrors: gqlErrorHandler });
          },
        },
      ],
    });
    await apollo.start();

    server.use(
      '/graphql',
      (_, res, next) => {
        // 앞 단계 미들웨어에서 오류발생했다면, graphQL 미들웨어 실행하지 않고 끝낼 수 있음
        if (res.encounteredErrorHandler) {
          return;
        }
        next();
      },
      expressMiddleware(apollo, {
        context: ({ req }) => Promise.resolve({ ip: req.ip }),
      }),
    );
  }
}
