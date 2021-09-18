import { useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useParams } from 'react-router';
import Modal from '../components-ui/Modal';
import Spinner from '../components-ui/Spinner';
import { useGetUserQuery, User } from '../generated/graphql';
import FollowItem from './FollowItem';

interface FollowModalProps {
  modalTitle: 'Followers' | 'Followings';
}

const FollowModal: React.FC<FollowModalProps> = ({ modalTitle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { username } = useParams<{ username: string }>();
  const { data, loading } = useGetUserQuery({
    variables: { username },
    skip: typeof username !== 'string',
  });
  const follows = useMemo(
    () =>
      modalTitle === 'Followers'
        ? data?.getUser?.profile.followers
        : data?.getUser?.profile.followings,
    [data, modalTitle]
  );

  if (loading && isOpen) {
    return <Spinner />;
  }

  return (
    <>
      <button
        onClick={() => {
          if (!follows || follows?.length > 0) setIsOpen(!isOpen);
        }}
        className='md:flex'
      >
        <strong className='md:mr-1'>{follows?.length || 0}</strong>
        <p className='text-gray-600 md:text-black'>
          {modalTitle.toLowerCase()}
        </p>
      </button>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <main className='bg-white rounded-md'>
          <header className='flex items-center justify-between p-3 border-b-2'>
            <div> </div>
            <h1 className='font-bold'>{modalTitle}</h1>
            <FaTimes
              className='ml-auto cursor-pointer'
              size='1.2em'
              onClick={() => setIsOpen(false)}
            />
          </header>
          <div className='px-3 overflow-y-auto max-h-96 h-96'>
            {follows?.map((u) => (
              <FollowItem
                key={`follow_${u.id}`}
                darkFollowButton
                s={u as User}
              />
            ))}
            {follows?.length === 0 && (
              <p className='py-3'>You have no {modalTitle.toLowerCase()}</p>
            )}
          </div>
        </main>
      </Modal>
    </>
  );
};

export default FollowModal;
