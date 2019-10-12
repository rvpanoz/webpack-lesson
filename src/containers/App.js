import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary'

// load css as a webpack modules
import styles from 'styles/app.css';
import theme from 'styles/theme.scss';

// lazy does not support named export
const Home = lazy(() => import('components/Home'));
const Page = lazy(() => import('components/Page'));

const App = () => <div className={styles.app}>
    <ErrorBoundary>
        <Suspense fallback={<div className={styles.spinner}></div>}>
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