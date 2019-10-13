import React from 'react'
import { Link } from 'react-router-dom';
import styles from 'styles/page.scss';

// load image as a webpack module
import webpackBundlerImg from 'images/webpack-bundler.png'
import entryConfig from 'images/entry-config.png';

const Home = () => {
    return (
        <div className={styles['article-text']}>
            <h2>What is Webpack?</h2>
            <p className={styles['article-text-teaser']}>
                At its core, webpack is a static module bundler for modern JavaScript applications.
                When webpack processes your application, it internally builds a dependency graph which maps every module your project needs and generates one or more bundles.
            </p>
            <h3>Everything is a module</h3>
            <p>
                <img src={webpackBundlerImg} alt="webpack-bundler" />
            </p>
            <p>Just like JS files can be “modules”, everything else (CSS, Images, HTML) can also be modules.
                That is, you can require(“myJSfile.js”) or require(“myCSSfile.css”). This mean we can split any artifact into smaller manageable pieces, reuse them and so on</p>
            <h3>Load only “what” you need and “when” you need </h3>
            <p>
                Split your code and generate multiple “bundle” files, and also load parts of the app asynchronously
                so that you just load what you need and when you need it.
            </p>
        </div>
    )
}

export default Home