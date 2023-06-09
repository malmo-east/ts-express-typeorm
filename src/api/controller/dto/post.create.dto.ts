import { IsNotEmpty } from 'class-validator';
import { PostCreate } from '../../../domain/post.js';
import { BaseDto } from './base.dto.js';

export class PostCreateDto extends BaseDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  author: string;

  @IsNotEmpty()
  content: string;

  toEntity(): PostCreate {
    return {
      title: this.title,
      author: this.author,
      content: this.content,
    };
  }
}
