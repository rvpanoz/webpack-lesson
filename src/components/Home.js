import React from 'react'
import cn from 'classnames';

import styles from 'styles/home.css';
console.log(styles);

const Home = () => <nav>
    <ul>
        <li><a className={cn(styles.item, styles.item0)} href="#">What is webpack?</a></li>
        <li><a className={cn(styles.item, styles.item1)} href="#">Setup webpack</a></li>
        <li><a className={cn(styles.item, styles.item2)} href="#">Configuration</a></li>
        <li><a className={cn(styles.item, styles.item3)} href="#">Loaders</a></li>
        <li><a className={cn(styles.item, styles.item4)} href="#">Plugins</a></li>
        <li><a className={cn(styles.item, styles.item5)} href="#">Bundling</a></li>
        <li><a className={cn(styles.item, styles.item6)} href="#">The development server</a></li>
        <li><a className={cn(styles.item, styles.item7)} href="#">Code splitting</a></li>
    </ul>
</nav>

export default Home