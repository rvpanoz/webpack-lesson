import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary'

// this component will not code splitted
import AppLoader from 'components/AppLoader'

// load css as a webpack modules
import styles from 'styles/app.css';

// lazy does not support named export
const Home = lazy(() => import(/* webpackChunkName: "Home" */'components/Home'));
const Page = lazy(() => import(/* webpackChunkName: "Page" */'components/Page'));

const App = () => <div className={styles.app}>
    <ErrorBoundary>
        <Suspense fallback={<AppLoader />}>
            <div className={styles.content}>
                <Router>
                    <Switch>
                        <Route exact path="/" component={Home} />
                        <Route path="/page" component={Page} />
                    </Switch>
                </Router>
            </div>
        </Suspense>
    </ErrorBoundary>
</div>

export default App;