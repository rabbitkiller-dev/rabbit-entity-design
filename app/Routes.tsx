/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';
import Editor from './containers/Editor';
import EntityEditorPage from './containers/EntityEditorPage';
import { useHistory } from "react-router-dom";

// Lazily load routes and code split with webpacck
const LazyCounterPage = React.lazy(() =>
  import(/* webpackChunkName: "CounterPage" */ './containers/CounterPage')
);

const CounterPage = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyCounterPage {...props} />
  </React.Suspense>
);

export default function Routes() {
  let history = useHistory();
  history.push('/editor');
  return (
    <App>
      <Switch>
        <Route path={routes.COUNTER} component={CounterPage} />
        <Route path={routes.EDITOR} component={EntityEditorPage}/>
        <Route
          path={routes.HOME}
          render={(props: any) => (
            <HomePage {...props}>
              <Route path="/editor2" component={Editor}/>
            </HomePage>
          )}
        />
      </Switch>
    </App>
  );
}
