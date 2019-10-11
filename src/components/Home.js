import React from 'react'
import cn from 'classnames';
import { Link } from 'react-router-dom'
import styles from 'styles/home.css';
import webpackImg from 'images/webpack.png'

const Home = () => <>
<nav>
    <ul>
        <li><Link className={cn(styles.item, styles.item1)} to="/">Home</Link></li>
        <li><Link className={cn(styles.item, styles.item1)} to="/setup">Setup</Link></li>

        {/* <li><a className={cn(styles.item, styles.item1)} href="#">Setup webpack</a></li>
        <li><a className={cn(styles.item, styles.item2)} href="#">Configuration</a></li>
        <li><a className={cn(styles.item, styles.item3)} href="#">Loaders</a></li>
        <li><a className={cn(styles.item, styles.item4)} href="#">Plugins</a></li>
        <li><a className={cn(styles.item, styles.item5)} href="#">Bundling</a></li>
        <li><a className={cn(styles.item, styles.item6)} href="#">The development server</a></li>
        <li><a className={cn(styles.item, styles.item7)} href="#">Code splitting</a></li> */}
    </ul>
</nav>
<img src={webpackImg} />
</>
export default Home