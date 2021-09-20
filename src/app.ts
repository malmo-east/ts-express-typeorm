import { json, urlencoded } from 'body-parser';
import * as compression from 'compression';
import * as cors from 'cors';
import * as express from 'express';
import * as helmet from 'helmet';
import * as morgan from 'morgan';
import { singleton } from 'tsyringe';
import { AppRouter } from './app.router';
import { errorHandler } from './lib/error.handlers';
import { logger } from './lib/logger';

@singleton()
export class App {
  readonly server = express();

  private isKeepAliveDisabled = false;

  constructor({ routes }: AppRouter) {
    const { server } = this;

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

    server.use(json());
    server.use(urlencoded({ extended: false }));
    server.use(compression());
    server.use((request, response, next): void => {
      if (this.isKeepAliveDisabled) {
        response.set('Connection', 'close');
      }
      next();
    });

    server.use(routes);
    server.use(errorHandler);
  }

  close(): void {
    this.isKeepAliveDisabled = true;
  }
}
