import { DataSource, Repository } from 'typeorm';
import { Post, PostCreate } from '../../domain/post.js';

export class PostMutation {
  private postRepository: Repository<Post>;

  constructor(ds: DataSource) {
    this.postRepository = ds.getRepository(Post);
  }

  createPost(newPost: PostCreate): Promise<Post> {
    return this.postRepository.save(newPost);
  }
}
