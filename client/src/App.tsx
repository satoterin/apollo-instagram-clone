import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Login from './routes/Login';
import Home from './routes/Home';
import './App.css';
import Register from './routes/Register';
import { MeDocument, useMeQuery } from './generated/graphql';
import Posts from './routes/Posts';
import Alert from './components-ui/Alert';
import { apolloClient } from '.';
import Spinner from './components-ui/Spinner';
import PrivateRoute from './containers/PrivateRoute';
import UpdateProfile from './routes/UpdateProfile';
import Profile from './routes/Profile';

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
      <Switch>
        <Route exact path='/' component={Home} />
        <Route exact path='/login' component={Login} />
        <Route exact path='/register' component={Register} />
        <PrivateRoute exact path='/posts' component={Posts} />
        <PrivateRoute exact path='/update-profile' component={UpdateProfile} />
        <PrivateRoute exact path='/:username' component={Profile} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
