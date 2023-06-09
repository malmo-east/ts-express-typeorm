import { ValidationError } from 'class-validator';
import { CustomExternalError } from './custom.external.error.js';

export class CustomValidationError extends CustomExternalError {
  constructor(errors: ValidationError[]) {
    super(errors.flatMap((e) => Object.values(e.constraints ? e?.constraints : [])));
  }
}
