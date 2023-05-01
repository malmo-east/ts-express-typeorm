import { DataSource, Repository } from 'typeorm';
import { Post } from '../../domain/post.js';
import { CustomExternalError } from '../../domain/error/custom.external.error.js';
import { ErrorCode } from '../../domain/error/error.code.js';

export class PostQuery {
  private postRepository: Repository<Post>;

  constructor(ds: DataSource) {
    this.postRepository = ds.getRepository(Post);
  }

  async getPost(id: string): Promise<Post> {
    try {
      return await this.postRepository.findOneOrFail({ where: { id } });
    } catch {
      throw new CustomExternalError([ErrorCode.ARTICLE_NOT_FOUND]);
    }
  }
}
