import React from 'react'
import { Link } from 'react-router-dom';

// load scss as a module
import styles from 'styles/page.scss';

// load image as a webpack module
import webpackBundlerImg from 'images/webpack.png'

const Home = () => {
    return (
        <div className={styles['article-text']}>
            <h2>Home page</h2>
            <p>
                <img src={webpackBundlerImg} alt="webpack-bundler" />
            </p>
            <p>
                Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old
            </p>
            <hr />
            <Link to="/page">Next page</Link>
        </div>
    )
}

export default Home