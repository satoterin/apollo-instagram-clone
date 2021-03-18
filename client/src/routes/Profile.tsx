import { Link, useParams } from 'react-router-dom';
import { apolloClient } from '..';
import Avatar from '../components-ui/Avatar';
import Container from '../components-ui/Container';
import Spinner from '../components-ui/Spinner';
import { useGetUserQuery, MeDocument } from '../generated/graphql';
import { AiOutlineTable, AiFillHeart } from 'react-icons/ai';
import { RiChat3Fill } from 'react-icons/ri';
import Button from '../components-ui/Button';
import Alert from '../components-ui/Alert';

const Profile: React.FC = () => {
  const { me } = apolloClient.readQuery({ query: MeDocument });

  const params: any = useParams();

  const { data, loading, error } = useGetUserQuery({
    variables: { username: params.username as string },
    fetchPolicy: 'network-only',
  });
  if (loading) {
    return <Spinner />;
  } else if (error) {
    console.log(error);
    <Alert severity='danger'>{JSON.stringify(error)}</Alert>;
  }
  if (data && data.getUser) {
    const {
      username,
      posts,
      profile: { imgURL, name, bio, website },
    } = data.getUser;
    return (
      <Container>
        {/* Profile Header */}
        <header className='grid items-center grid-cols-2 md:px-3 md:w-8/12'>
          <Avatar
            src={imgURL}
            alt=''
            className='self-start col-start-1 row-span-1 ml-3 mr-auto w-28 h-28 md:order-1 md:mx-auto md:w-52 md:h-52 md:row-span-3'
          />
          <div className='flex flex-col col-start-2 pr-3 -ml-10 md:order-2 md:ml-3 md:items-center md:flex-row'>
            <p className='text-3xl font-normal'>{username}</p>
            {me.username === username && (
              <Link to='/edit-profile'>
                <Button className='mt-3 md:ml-4 md:mt-0'>Edit Profile</Button>
              </Link>
            )}
          </div>
          <div className='col-span-2 col-start-1 p-3 mt-3 md:order-4 md:col-start-2'>
            <strong>{name}</strong>
            <p className='text-lg'>{bio}</p>
            <a
              className='font-semibold text-blue-600'
              href={website}
              target='_blank'
            >
              {website.replace('https://', '')}
            </a>
          </div>
          <main className='flex justify-between col-span-2 col-start-1 gap-3 px-3 pt-3 mt-2 text-lg text-center border-t border-gray-300 md:order-3 md:text-left md:col-start-2 md:col-span-1 md:border-none'>
            <div className='md:flex'>
              <strong className='md:mr-1'>{posts.length}</strong>
              <p className='text-gray-600 md:text-black'>posts</p>
            </div>
            <div className='md:flex'>
              <strong className='md:mr-1'>20</strong>
              <p className='text-gray-600 md:text-black'>followers</p>
            </div>
            <div className='md:flex'>
              <strong className='md:mr-1'>100</strong>
              <p className='text-gray-600 md:text-black'>following</p>
            </div>
          </main>
        </header>
        {/* Tab | Posts */}
        <section className='flex justify-center mt-4 border-t border-gray-300'>
          <header className='flex items-center justify-center py-2 border-t border-gray-800'>
            <AiOutlineTable />
            <strong className='my-0 mt-1 ml-2 font-bold text-gray-800 uppercase'>
              Posts
            </strong>
          </header>
        </section>
        {/* Posts Grid */}
        <section className='grid grid-cols-2 gap-1 mt-2 md:grid-cols-3 md:gap-4'>
          {posts.length === 0 && (
            <strong className='col-start-2 text-gray-500'>
              No Posts Uploaded
            </strong>
          )}
          {posts.map(({ imgURL, comments, likeCount, id }) => (
            <Link
              key={id}
              className='relative w-full h-32 md:h-64'
              to={`/p/${id}`}
            >
              <img
                className='z-10 object-cover w-full h-full'
                src={imgURL}
                alt=''
              />
              <div className='absolute top-0 left-0 z-20 flex items-center justify-center w-full h-full text-lg text-white text-opacity-100 bg-black opacity-0 bg-opacity-30 hover:opacity-100'>
                <div className='flex items-center'>
                  <div className='z-30 flex items-center mr-2'>
                    <AiFillHeart />
                    <strong className='ml-1'>{likeCount}</strong>
                  </div>
                  <div className='z-30 flex items-center ml-2'>
                    <RiChat3Fill />
                    <strong className='ml-1'>{comments.length}</strong>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </Container>
    );
  }

  return null;
};

export default Profile;
