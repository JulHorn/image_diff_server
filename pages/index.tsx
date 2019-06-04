import * as React from 'react'
import Link from 'next/link'
import styles from './index.scss'

class IndexPage extends React.Component {
	render() {
		return (
			<div className={styles.example} title="Home | Next.js + TypeScript Example">
				<h1>Hello Next.js 👋</h1>
				<p>
					<Link href="/about">
						<a>About</a>
					</Link>
				</p>
			</div>
		)
	}
}

export default IndexPage
