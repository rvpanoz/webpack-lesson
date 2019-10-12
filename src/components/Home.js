import React from 'react'
import { Link } from 'react-router-dom';
import styles from 'styles/page.css';

// load image as a webpack module
import webpackImg from 'images/webpack.png'

const Home = () => {
    return (
        <div className={styles.container}>
            <h1>Hola!</h1>
            <p><img src={webpackImg} alt="webpack" /></p>
            <p><Link to="/page">next page</Link></p>
        </div>
    )
}

export default Home