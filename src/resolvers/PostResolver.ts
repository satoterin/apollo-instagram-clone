import { AuthenticationError } from 'apollo-server-express';
import { validate } from 'class-validator';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { Follow } from '../entities/Follow';
import { Post } from '../entities/Post';
import { User } from '../entities/User';
import { isAuth } from '../middlewares/isAuth';
import { FieldError, MyContext } from '../types';
import { formatErrors } from '../utils/formatErrors';
import { uploadFile } from '../utils/uploadFile';

@ObjectType()
class CreatePostResponse {
  @Field()
  ok: boolean;
  @Field(() => Post, { nullable: true })
  post?: Post;
  @Field(() => FieldError, { nullable: true })
  error?: FieldError;
}

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  @UseMiddleware(isAuth)
  getPosts() {
    return Post.find({
      order: { createdAt: 'DESC' },
      relations: ['user', 'likes', 'comments', 'likes.user', 'comments.user'],
    });
  }

  @Query(() => [Post])
  @UseMiddleware(isAuth)
  async getFeedPosts(@Ctx() { req }: MyContext) {
    const followings = await Follow.find({
      where: { followerId: req.session.userId },
      select: ['following'],
      relations: ['following.posts'],
    });
    const feedPosts: Post[] = [];
    followings.forEach((f) => {
      feedPosts.push(...f.following.posts);
    });
    return feedPosts;
  }

  @Query(() => Post, { nullable: true })
  getSinglePost(@Arg('postId') postId: string) {
    return Post.findOne({
      where: { id: postId },
      relations: ['user', 'likes', 'comments', 'likes.user', 'comments.user'],
    });
  }

  @Mutation(() => CreatePostResponse)
  async addPost(
    @Arg('caption') caption: string,
    @Ctx() { req }: MyContext,
    @Arg('file', () => GraphQLUpload)
    file: FileUpload
  ): Promise<CreatePostResponse> {
    const user = await User.findOne({ id: req.session.userId });
    if (!user) {
      throw new AuthenticationError('Unauthorized');
    }
    const { isUploaded, imgURL } = await uploadFile(file, 'posts');
    if (isUploaded) {
      const post = Post.create({ caption, imgURL, user });
      const errors = await validate(post);
      if (errors.length > 0) {
        return { ok: false, error: formatErrors(errors)[0] };
      }
      await post.save();
      return { ok: true, post };
    }
    return { ok: false, error: { path: 'file', message: 'File Upload Fail' } };
  }
}
/*
 * curl 'http://localhost:5000/graphql' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'DNT: 1' -H 'Origin: http://localhost:5000' --data-binary '{"query":"mutation AddPost($file: Upload!){\n  addPost(file)\n}"}' --compressed
 *
 */
