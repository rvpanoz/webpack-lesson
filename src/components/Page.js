import React from 'react'
import { Link } from 'react-router-dom';
import styles from 'styles/page.scss';

const DependencyGraph = () => {
    return (
        <div className={styles.container}>
            <h1>Hey!</h1>
            <p>webpack is awesome..</p>
            <p><Link to="/">back</Link></p>
        </div>
    )
}

export default DependencyGraph;