import { useState, useEffect } from 'react';
import Avatar from '../components-ui/Avatar';
import Card from '../components-ui/Card';
import {
  Comment,
  Post,
  useMeQuery,
  useDeletePostMutation,
} from '../generated/graphql';
import { MdMoreHoriz } from 'react-icons/md';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { RiChat1Line } from 'react-icons/ri';
import AddComment from './AddComment';
import LikeButton from './LikeButton';
// import { apolloClient } from '..';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Link, useHistory } from 'react-router-dom';
import { useRef } from 'react';
import ActionModal from './ActionModal';
import { useMessageCtx } from '../context/MessageContext';
import Modal from '../components-ui/Modal';
import EditCaption from './EditCaption';

dayjs.extend(relativeTime);

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({
  post: { id, user, imgURL, caption, likeCount, userLike, comments, createdAt },
}) => {
  const { setMessage } = useMessageCtx();
  const [twoComments, setTwoComments] = useState<any>([]);
  const [liked, setLiked] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [openEditCaption, setOpenEditCaption] = useState(false);

  const { data: meData } = useMeQuery({ fetchPolicy: 'cache-only' });
  const [deletePost] = useDeletePostMutation();

  useEffect(() => {
    setTwoComments(
      comments.filter((_, index) => index === 0 || index === 1).reverse()
    );
  }, [comments, setTwoComments]);

  useEffect(() => {
    setLiked(userLike);
  }, [userLike]);

  const history = useHistory();
  const addCommentRef = useRef<HTMLInputElement>(null);

  return (
    <Card id={id} className='w-full mb-16'>
      {/* header */}
      <div className='flex items-center justify-between px-3 border-b border-gray-300'>
        <div className='flex items-center'>
          <Link to={`/u/${user.username}`} className='flex items-center'>
            <Avatar className='my-2 cursor-pointer' src={user.profile.imgURL} />
            <span className='ml-2 font-semibold hover:underline'>
              {user.username}
            </span>
          </Link>
        </div>
        {/* TODO Icon Button */}
        <div
          className='cursor-pointer'
          role='button'
          onClick={(e) => setIsOpen(true)}
        >
          <MdMoreHoriz size='1.5em' />
          <ActionModal isOpen={isOpen} setIsOpen={setIsOpen}>
            {meData && meData.me && meData.me.username === user.username && (
              <>
                <li
                  className='red'
                  onClick={async () => {
                    await deletePost({
                      variables: { postId: id },
                      update: (cache, { data }) => {
                        if (data?.deletePost) {
                          cache.evict({ id: 'Post:' + id });
                          setIsOpen(false);
                          setMessage('Post removed successfully');
                          history.push('/');
                        }
                      },
                    });
                  }}
                >
                  Delete Post
                </li>
                <li
                  onClick={() => {
                    setOpenEditCaption(true);
                    setIsOpen(false);
                  }}
                >
                  Edit caption
                </li>
              </>
            )}
            <li onClick={() => history.push(`/p/${id}`)}>Go to Post</li>
          </ActionModal>
          {/* Edit Caption Modal */}
          <Modal isOpen={openEditCaption} setIsOpen={setOpenEditCaption}>
            <EditCaption
              postCaption={caption}
              postId={id}
              postImage={imgURL}
              close={() => {
                setOpenEditCaption(false);
                setIsOpen(false);
              }}
            />
          </Modal>
        </div>
      </div>
      {/* Media */}
      <img className='w-full' src={imgURL} alt='' />
      {/* Likes and comments */}
      <div className='h-full'>
        <div className='flex flex-col justify-between px-3 py-2'>
          {/* Like And Comment Button */}
          <div className='flex items-center pb-2'>
            <LikeButton postId={id} liked={liked} setLiked={setLiked}>
              {liked ? (
                <FaHeart
                  size='2em'
                  className='mr-2 text-red-600 duration-150 transform cursor-pointer active:scale-110'
                />
              ) : (
                <FaRegHeart
                  size='2em'
                  className='mr-2 duration-150 transform cursor-pointer active:scale-110'
                />
              )}
            </LikeButton>
            <RiChat1Line
              size='2.3em'
              onClick={() => {
                if (history.location.pathname === '/posts') {
                  history.push(`/p/${id}`);
                } else {
                  addCommentRef.current?.focus();
                }
              }}
              className='cursor-pointer'
            />
          </div>
          {/* Like Count */}
          <p className='font-semibold '>
            {likeCount} like{likeCount !== 1 ? 's' : ''}
          </p>
          {/* Post Caption */}
          <div>
            <Link
              to={`/u/${user.username}`}
              className='mr-1 font-semibold hover:underline'
            >
              {user.username}
            </Link>
            <span>{caption}</span>
          </div>
          {/* Comment Count */}
          {comments.length > 2 && (
            <Link
              to={`/p/${id}`}
              className='py-1 text-gray-600 cursor-pointer '
            >
              View all {comments.length} comments
            </Link>
          )}
          {/* Comments */}
          <div className='py-1 '>
            {twoComments.map((c: Comment) => (
              <p key={c.id} className=''>
                <Link
                  to={`/u/${c.username}`}
                  className='mr-1 font-semibold hover:underline'
                >
                  {c.username}
                </Link>

                {c.text}
              </p>
            ))}
          </div>
          {/* TimeStamp */}
          <Link
            to={`/p/${id}`}
            className='py-1 text-xs text-gray-500 uppercase'
          >
            {dayjs(createdAt).fromNow()}
          </Link>
        </div>
        <AddComment customRef={addCommentRef} postId={id} />
      </div>
    </Card>
  );
};

export default PostCard;
