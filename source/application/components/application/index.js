import autobind from 'autobind-decorator';
import React, {Component, PropTypes as t} from 'react';
import Helmet from 'react-helmet';
import styled, {ThemeProvider, injectGlobal} from 'styled-components';

import Hamburger from '../../containers/hamburger';
import Navigation from '../../containers/navigation';
import Search from '../../containers/search';
import * as themes from '../../themes';

@autobind
export default class Application extends Component {
	componentDidMount() {
		this.props.onLoad();
		global.addEventListener('resize', this.onResize);
	}

	componentWillMount() {
		/* eslint-disable no-unused-expressions */
		injectGlobal`
			html,
			body {
				height: 100%;
				overflow: hidden;
			}
			body {
				margin: 0;
				height: 100%;
			}
			[data-application] {
				height: 100%;
			}
		`;
		/* eslint-enable */
	}

	componentWillUnmount() {
		global.removeEventListener('resize', this.onResize);
	}

	onResize() {
		this.props.onResize({
			width: global.innerWidth,
			height: global.innerHeight
		});
	}

	render() {
		const {props} = this;

		return (
			<ThemeProvider theme={themes[props.theme]}>
				<StyledApplication navigationEnabled={props.navigationEnabled}>
					<Helmet meta={meta(props)} title={props.title}/>
					<StyledNavigationBox>
						<StyledHamburgerBox>
							<Hamburger/>
						</StyledHamburgerBox>
						{
							props.navigationEnabled &&
								<ThemeProvider theme={themes.dark}>
									<Navigation/>
								</ThemeProvider>
						}
					</StyledNavigationBox>
					<StyledContent>
						{props.children}
						{props.searchEnabled &&
							<ThemeProvider theme={themes.dark}>
								<StyledSearchBox>
									<StyledSearchFrame>
										<Search/>
									</StyledSearchFrame>
								</StyledSearchBox>
							</ThemeProvider>
						}
					</StyledContent>
					<Lightbox id={props.lightbox}/>
				</StyledApplication>
			</ThemeProvider>
		);
	}
}

Application.propTypes = {
	children: t.any,
	description: t.string.isRequired,
	lightbox: t.string,
	navigationEnabled: t.bool.isRequired,
	onLoad: t.func.isRequired,
	onResize: t.func.isRequired,
	searchEnabled: t.bool.isRequired,
	theme: t.string.isRequired,
	title: t.string.isRequired
};

function Lightbox(props) {
	switch (props.id) {
		default:
			return null;
	}
}

Lightbox.propTypes = {
	id: t.string
};

const StyledApplication = styled.div`
	box-sizing: border-box;
	display: flex;
	width: calc(100% + ${props => props.navigationEnabled === true ? 0 : '300px'});
	height: 100%;
	background: ${props => props.theme.background};
	transform: translateX(${props => props.navigationEnabled === true ? 0 : '-300px'});
`;

const StyledHamburgerBox = styled.div`
	position: absolute;
	left: 315px;
	top: 10px;
`;

const StyledNavigationBox = styled.div`
	position: relative;
	z-index: 2;
	flex: 0 0 300px;
	width: 300px;
	height: 100%;
`;

const StyledContent = styled.div`
	width: 100%;
	height: 100%;
	position: relative;
`;

const StyledSearchBox = styled.div`
	position: absolute;
	top: 12.5vh;
	bottom: 10vh;
	right: 0;
	left: 0;
	width: 100%;
	pointer-events: none;
`;

const StyledSearchFrame = styled.div`
	width: 90%;
	min-width: 320px;
	max-width: 750px;
	max-height: 100%;
	margin: 0 auto;
	overflow: hidden;
`;

function meta(props) {
	return [
		{name: 'description', content: props.description},
		{name: 'viewport', content: 'width=device-width, initial-scale=1'}
	];
}
