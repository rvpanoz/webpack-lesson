import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary'

// load css
import appStyles from 'styles/app.css';
console.log(appStyles);

// lazy does not support named export
const Home = lazy(() => import('components/Home'));
const Setup = lazy(() => import('components/Setup'));

const App = () => <section>
    <ErrorBoundary>
        <Router>
            <Suspense fallback={<div>Loading...</div>}>
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route path="/setup" component={Setup} />
                </Switch>
            </Suspense>
        </Router>
    </ErrorBoundary>
</section>

export default App;