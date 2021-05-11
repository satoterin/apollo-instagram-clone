import Button from '../components-ui/Button';
import Container from '../components-ui/Container';
import InputField from '../components-ui/InputField';
import { useEditProfileMutation, useMeQuery } from '../generated/graphql';
import ChangeProfilePhoto from '../components/ChangeProfilePhoto';
import { Field, Form, Formik } from 'formik';

const EditProfile: React.FC = () => {
  const { data } = useMeQuery({ fetchPolicy: 'cache-only' });
  const [editProfile] = useEditProfileMutation();

  if (!data) return null;

  const {
    username,
    email,
    profile: { name, bio, gender, website },
  } = data.me!;

  if (!username) return null;

  return (
    <Container>
      <div className='flex bg-white border border-gray-300 rounded-lg md:pl-0'>
        <div className='hidden pt-5 border-gray-300 md:w-80 md:border-r md:flex'>
          <div className='flex flex-col flex-1'>
            <ul>
              <li className='px-5 py-2 font-bold border-l-2 border-black'>
                Edit Profile
              </li>
              <li className='px-5 py-2'>Change Password</li>
            </ul>
          </div>
        </div>
        <div className='flex flex-col w-full p-5 md:mx-20'>
          <div className='py-4'>
            <ChangeProfilePhoto username={username} />
          </div>
          <Formik
            initialValues={{
              name,
              website,
              bio,
              gender,
              username,
              email,
            }}
            onSubmit={async (values, action) => {
              try {
                const res = await editProfile({
                  variables: values,
                });
                if (res.data) {
                  const { errors } = res.data.editProfile;
                  if (errors) {
                    errors.forEach(({ path, message }) => {
                      action.setFieldError(path, message);
                    });
                  }
                }
                console.log(res);
              } catch (err) {
                console.log(err);
              }
            }}
          >
            {({ isSubmitting, values: { username, email } }) => (
              <Form className='flex flex-col w-full mb-5'>
                <InputField
                  inline
                  name='name'
                  label='Name'
                  error=''
                  helperText="Help people discover your account by using the name you're known by: either your full name, nickname, or business name."
                />
                {/* <InputField inline name='username' disabled label='Username' /> */}
                <InputField inline type='url' name='website' label='Website' />
                <div className='gap-10 mb-5 md:grid md:grid-cols-2-form'>
                  <label
                    htmlFor='bio'
                    className='block font-bold md:text-right'
                  >
                    Bio
                  </label>
                  <Field
                    as='textarea'
                    name='bio'
                    className='w-full px-2 py-1 mb-3 border border-gray-300 rounded-md bg-blue-50 focus:border-gray-500'
                  ></Field>
                </div>

                <InputField inline name='email' label='Email' />

                <InputField inline name='gender' label='Gender' error='' />
                <div className='gap-10 mb-5 md:grid md:grid-cols-2-form'>
                  <div></div>
                  <Button
                    isLoading={isSubmitting}
                    className='inline-block w-20 text-left'
                    disabled={!username || !email}
                    color='dark'
                    type='submit'
                  >
                    Submit
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </Container>
  );
};

export default EditProfile;
