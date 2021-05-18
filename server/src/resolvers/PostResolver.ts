import { validate } from 'class-validator';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  ID,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { CLOUDINARY_ROOT_PATH, __prod__ } from '../constants';
import { Comment } from '../entities/Comment';
import { Like } from '../entities/Like';
import { Post } from '../entities/Post';
import { User } from '../entities/User';
import { isAuth } from '../middlewares/isAuth';
import { FieldError, MyContext } from '../types';
import { PaginatedPost } from '../types/postTypes';
import { checkUserFromCookie } from '../utils/checkUserFromCookie';
import { formatErrors } from '../utils/formatErrors';
import {
  uploadToCloudinary,
  generateUrl,
  deleteCloudinaryFile,
} from '../utils/uploadHandler';

@ObjectType()
class CreatePostResponse {
  @Field()
  ok: boolean;

  @Field(() => Post, { nullable: true })
  post?: Post;

  @Field(() => FieldError, { nullable: true })
  error?: FieldError;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => User)
  user(@Root() post: Post, @Ctx() { userLoader }: MyContext): Promise<User> {
    return userLoader.load(post.username);
  }

  @FieldResolver(() => Int)
  likeCount(@Root() post: Post): Promise<number> {
    return Like.count({ where: { postId: post.id } });
  }

  @FieldResolver(() => Boolean)
  @UseMiddleware(isAuth)
  async userLike(
    @Root() post: Post,
    @Ctx() { res }: MyContext
  ): Promise<boolean> {
    const like = await Like.findOne({
      where: { postId: post.id, username: res.locals.username },
    });
    return like ? true : false;
  }

  @FieldResolver(() => [Comment])
  comments(@Root() post: Post): Promise<Comment[]> {
    return Comment.find({
      where: { postId: post.id },
      order: { createdAt: 'DESC' },
    });
  }

  @FieldResolver(() => String)
  imgURL(@Root() post: Post): string {
    if (post.imgURL.includes(CLOUDINARY_ROOT_PATH)) {
      return generateUrl(post.imgURL, 'posts');
    }
    return post.imgURL;
  }

  @Query(() => PaginatedPost)
  @UseMiddleware(isAuth)
  async getPosts(
    @Arg('limit', () => Int) limit: number,
    @Arg('offset', () => Int, { nullable: true }) offset?: number
  ): Promise<PaginatedPost> {
    // TODO: Pagination
    const posts = await Post.find({
      order: { createdAt: 'DESC' },
      skip: offset ? offset : 0,
      take: limit + 1,
    });
    return {
      posts: posts.slice(0, limit),
      hasMore: posts.length === limit + 1,
    };
  }

  // @Query(() => [Post])
  // @UseMiddleware(isAuth)
  // async getFeedPosts(@Ctx() { res }: MyContext) {
  //   const followings = await Follow.find({
  //     where: { username: res.locals.username },
  //     select: ['following'],
  //     relations: ['following.posts'],
  //   });
  //   const feedPosts: Post[] = [];
  //   followings.forEach((f) => {
  //     feedPosts.push(...f.following.posts);
  //   });
  //   return feedPosts;
  // }

  @Query(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  getSinglePost(@Arg('postId') postId: string) {
    return Post.findOne({
      where: { id: postId },
    });
  }

  @Mutation(() => CreatePostResponse)
  async addPost(
    @Arg('caption') caption: string,
    @Ctx() ctx: MyContext,
    @Arg('file', () => GraphQLUpload)
    file: FileUpload
  ): Promise<CreatePostResponse> {
    const { user } = await checkUserFromCookie(ctx);

    // const { isUploaded, imgURL } = await uploadFile(file, 'posts');
    const { url } = await uploadToCloudinary(file, 'posts');
    // if (isUploaded) {
    if (url) {
      const post = Post.create({ caption, imgURL: url, user });
      const errors = await validate(post);
      if (errors.length > 0) {
        return { ok: false, error: formatErrors(errors)[0] };
      }
      await post.save();
      return { ok: true, post };
    }
    return { ok: false, error: { path: 'file', message: 'File Upload Fail' } };
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg('postId', () => ID) postId: string,
    @Ctx() { res }: MyContext
  ) {
    try {
      const post = await Post.findOne({
        where: { id: postId, username: res.locals.username },
      });
      if (!post) return false;
      if (post.imgURL.startsWith(CLOUDINARY_ROOT_PATH)) {
        const isImageDeleted = await deleteCloudinaryFile(post.imgURL);
        if (!isImageDeleted) return false;
      }
      await post.remove();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
/*
 * curl 'http://localhost:5000/graphql' -H 'Accept-Encoding: gzip, deflate, br' -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' -H 'DNT: 1' -H 'Origin: http://localhost:5000' --data-binary '{"query":"mutation AddPost($file: Upload!){\n  addPost(file)\n}"}' --compressed
 *
 */
