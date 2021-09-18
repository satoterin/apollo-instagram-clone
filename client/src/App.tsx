import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.css';
import { MeDocument, useMeQuery } from './generated/graphql';
import Alert from './components-ui/Alert';
import { apolloClient } from './utils/apolloClient';
import Spinner from './components-ui/Spinner';
import PrivateRoute from './containers/PrivateRoute';

// Routes
import Login from './routes/Login';
import Register from './routes/Register';
import Posts from './routes/Posts';
import EditProfile from './routes/EditProfile';
import Profile from './routes/Profile';
import SinglePost from './routes/SinglePost';
import MessageProvider from './context/MessageContext';
import Explore from './routes/Explore';

const App: React.FC = () => {
  const { loading, error } = useMeQuery({ fetchPolicy: 'network-only' });

  if (loading) {
    return <Spinner />;
  } else if (error) {
    apolloClient.writeQuery({ query: MeDocument, data: { me: null } });
    return <Alert severity='danger'>{error.message}</Alert>;
  }

  return (
    <BrowserRouter>
      <MessageProvider>
        <div className='pb-10'>
          <Switch>
            <PrivateRoute exact path='/' component={Posts} />
            <PrivateRoute exact path='/explore' component={Explore} />
            <Route exact path='/login' component={Login} />
            <Route exact path='/register' component={Register} />
            <PrivateRoute exact path='/p/:postId' component={SinglePost} />
            <PrivateRoute exact path='/edit-profile' component={EditProfile} />
            <PrivateRoute exact path='/u/:username' component={Profile} />
          </Switch>
        </div>
      </MessageProvider>
    </BrowserRouter>
  );
};

export default App;
