import React from 'react';
import { createAppContainer, createSwitchNavigator, NavigationActions } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { Provider } from 'react-redux';
import { useScreens } from 'react-native-screens'; // eslint-disable-line import/no-unresolved
import {
	View, Linking, Modal, TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';
import Orientation from 'react-native-orientation-locker';

import { appInit } from './actions';
import { deepLinkingOpen } from './actions/deepLinking';
import Navigation from './lib/Navigation';
import parseQuery from './lib/methods/helpers/parseQuery';
import { initializePushNotifications, onNotification } from './notifications/push';
import store from './lib/createStore';
import NotificationBadge from './notifications/inApp';
import { defaultHeader, onNavigationStateChange } from './utils/navigation';
import { loggerConfig, analytics } from './utils/log';
import Toast from './containers/Toast';
import RocketChat from './lib/rocketchat';
import { COLOR_BORDER } from './constants/colors';
import LayoutAnimation from './utils/layoutAnimation';

useScreens();

const parseDeepLinking = (url) => {
	if (url) {
		url = url.replace(/rocketchat:\/\/|https:\/\/go.rocket.chat\//, '');
		const regex = /^(room|auth)\?/;
		if (url.match(regex)) {
			url = url.replace(regex, '').trim();
			if (url) {
				return parseQuery(url);
			}
		}
	}
	return null;
};

// Outside
const OutsideStack = createStackNavigator({
	OnboardingView: {
		getScreen: () => require('./views/OnboardingView').default,
		header: null
	},
	NewServerView: {
		getScreen: () => require('./views/NewServerView').default
	},
	LoginSignupView: {
		getScreen: () => require('./views/LoginSignupView').default
	},
	LoginView: {
		getScreen: () => require('./views/LoginView').default
	},
	ForgotPasswordView: {
		getScreen: () => require('./views/ForgotPasswordView').default
	},
	RegisterView: {
		getScreen: () => require('./views/RegisterView').default
	},
	LegalView: {
		getScreen: () => require('./views/LegalView').default
	}
}, {
	defaultNavigationOptions: defaultHeader
});

const AuthenticationWebViewStack = createStackNavigator({
	AuthenticationWebView: {
		getScreen: () => require('./views/AuthenticationWebView').default
	}
}, {
	defaultNavigationOptions: defaultHeader
});

const OutsideStackModal = createStackNavigator({
	OutsideStack,
	AuthenticationWebViewStack
},
{
	mode: 'modal',
	headerMode: 'none'
});

// Side list
const ListStack = createStackNavigator({
	RoomsListView: {
		getScreen: () => require('./views/RoomsListView').default
	},
	DirectoryView: {
		getScreen: () => require('./views/DirectoryView').default
	},
	SelectedUsersView: {
		getScreen: () => require('./views/SelectedUsersView').default
	}
}, {
	defaultNavigationOptions: defaultHeader
});

// Inside
const ChatsStack = createStackNavigator({
	Home: {
		getScreen: () => require('./views/RoomView').default
	},
	RoomView: {
		getScreen: () => require('./views/RoomView').default
	},
	RoomActionsView: {
		getScreen: () => require('./views/RoomActionsView').default
	},
	RoomInfoView: {
		getScreen: () => require('./views/RoomInfoView').default
	},
	RoomInfoEditView: {
		getScreen: () => require('./views/RoomInfoEditView').default
	},
	RoomMembersView: {
		getScreen: () => require('./views/RoomMembersView').default
	},
	SearchMessagesView: {
		getScreen: () => require('./views/SearchMessagesView').default
	},
	SelectedUsersView: {
		getScreen: () => require('./views/SelectedUsersView').default
	},
	ThreadMessagesView: {
		getScreen: () => require('./views/ThreadMessagesView').default
	},
	MessagesView: {
		getScreen: () => require('./views/MessagesView').default
	},
	AutoTranslateView: {
		getScreen: () => require('./views/AutoTranslateView').default
	},
	ReadReceiptsView: {
		getScreen: () => require('./views/ReadReceiptView').default
	},
	TableView: {
		getScreen: () => require('./views/TableView').default
	},
	NotificationPrefView: {
		getScreen: () => require('./views/NotificationPreferencesView').default
	}
}, {
	defaultNavigationOptions: defaultHeader
});

ChatsStack.navigationOptions = ({ navigation }) => {
	let drawerLockMode = 'unlocked';
	if (navigation.state.index > 0) {
		drawerLockMode = 'locked-closed';
	}
	return {
		drawerLockMode
	};
};

const ProfileStack = createStackNavigator({
	ProfileView: {
		getScreen: () => require('./views/ProfileView').default
	}
}, {
	defaultNavigationOptions: defaultHeader
});

ProfileStack.navigationOptions = ({ navigation }) => {
	let drawerLockMode = 'unlocked';
	if (navigation.state.index > 0) {
		drawerLockMode = 'locked-closed';
	}
	return {
		drawerLockMode
	};
};

const SettingsStack = createStackNavigator({
	SettingsView: {
		getScreen: () => require('./views/SettingsView').default
	},
	LanguageView: {
		getScreen: () => require('./views/LanguageView').default
	}
}, {
	defaultNavigationOptions: defaultHeader
});

const AdminPanelStack = createStackNavigator({
	AdminPanelView: {
		getScreen: () => require('./views/AdminPanelView').default
	}
}, {
	defaultNavigationOptions: defaultHeader
});

SettingsStack.navigationOptions = ({ navigation }) => {
	let drawerLockMode = 'unlocked';
	if (navigation.state.index > 0) {
		drawerLockMode = 'locked-closed';
	}
	return {
		drawerLockMode
	};
};

const ChatsDrawer = createDrawerNavigator({
	ListStack,
	ProfileStack,
	SettingsStack,
	AdminPanelStack
}, {
	contentComponent: () => null
});

const NewMessageStack = createStackNavigator({
	NewMessageView: {
		getScreen: () => require('./views/NewMessageView').default
	},
	SelectedUsersViewCreateChannel: {
		getScreen: () => require('./views/SelectedUsersView').default
	},
	CreateChannelView: {
		getScreen: () => require('./views/CreateChannelView').default
	}
}, {
	defaultNavigationOptions: defaultHeader
});

const InsideStackModal = createStackNavigator({
	Main: ChatsStack,
	JitsiMeetView: {
		getScreen: () => require('./views/JitsiMeetView').default
	}
},
{
	mode: 'modal',
	headerMode: 'none'
});

const ListStackModal = createStackNavigator({
	Main: ChatsDrawer,
	NewMessageStack
},
{
	mode: 'modal',
	headerMode: 'none'
});

const SetUsernameStack = createStackNavigator({
	SetUsernameView: {
		getScreen: () => require('./views/SetUsernameView').default
	}
});

class CustomInsideStack extends React.Component {
	static router = InsideStackModal.router;

	static propTypes = {
		navigation: PropTypes.object
	}

	render() {
		const { navigation } = this.props;
		return (
			<React.Fragment>
				<InsideStackModal navigation={navigation} />
				<NotificationBadge navigation={navigation} />
				<Toast />
			</React.Fragment>
		);
	}
}

const App = createAppContainer(createSwitchNavigator(
	{
		OutsideStack: OutsideStackModal,
		InsideStack: CustomInsideStack,
		AuthLoading: {
			getScreen: () => require('./views/AuthLoadingView').default
		},
		SetUsernameStack
	},
	{
		initialRouteName: 'AuthLoading'
	}
));

const ListContainer = createAppContainer(ListStackModal);

export class MasterDetailView extends React.Component {
	state = {
		inside: false,
		landscape: Orientation.getInitialOrientation().includes('LANDSCAPE'),
		inCall: false,
		showModal: false,
		modalName: null
	};

	componentDidMount() {
		const defaultDetailsGetStateForAction = ListContainer.router.getStateForAction;
		const defaultMasterGetStateForAction = App.router.getStateForAction;

		ListContainer.router.getStateForAction = (action, state) => {
			if (action.type === NavigationActions.NAVIGATE) {
				const { routeName, params } = action;
				if (routeName === 'RoomView') {
					this.listRef.dispatch(NavigationActions.navigate({ routeName: 'RoomsListView' }));
					Navigation.navigate('Home');
				}
				if (routeName === 'OnboardingView') {
					this.setState({ inside: false });
				}
				if (routeName === 'NewMessageView') {
					this.setState({ showModal: true, modalName: 'NewMessageView' });
					return null;
				}
				if (routeName === 'DirectoryView') {
					this.setState({ showModal: true, modalName: 'DirectoryView' });
					return null;
				}
				Navigation.navigate(routeName, params);
			}
			if (action.type === 'Navigation/TOGGLE_DRAWER') {
				this.setState({ showModal: true, modalName: 'SidebarView' });
				return null;
			}
			return defaultDetailsGetStateForAction(action, state);
		};

		App.router.getStateForAction = (action, state) => {
			const { inCall } = this.state;
			if (action.type === NavigationActions.NAVIGATE) {
				const { routeName } = action;
				if (routeName === 'InsideStack') {
					this.setState({ inside: true });
				}
				if (routeName === 'OutsideStack') {
					this.setState({ inside: false });
				}
				if (routeName === 'JitsiMeetView') {
					this.setState({ inCall: true });
				}
				if (routeName === 'RoomView') {
					this.setState({ showModal: false });
				}
			}
			if (action.type === 'Navigation/POP' && inCall) {
				this.setState({ inCall: false });
			}
			return defaultMasterGetStateForAction(action, state);
		};
		Orientation.addOrientationListener(this._orientationDidChange);
	}

	componentWillUnmount() {
		Orientation.removeOrientationListener(this._orientationDidChange);
	}

	_orientationDidChange = orientation => this.setState({ landscape: orientation.includes('LANDSCAPE') });

	renderModal = () => {
		const { showModal, modalName } = this.state;
		const NewMessageView = require('./views/NewMessageView').default;
		const SidebarView = require('./views/SidebarView').default;
		const DirectoryView = require('./views/DirectoryView').default;
		return (
			<Modal
				presentationStyle='formSheet'
				animationType='slide'
				visible={showModal}
			>
				<View style={{ flex: 1 }}>
					<TouchableOpacity onPress={() => this.setState({ showModal: false })} style={{ height: 50, width: 50, backgroundColor: 'green' }} />
					{ modalName === 'NewMessageView' ? <NewMessageView navigation={Navigation} /> : null }
					{ modalName === 'SidebarView' ? <SidebarView navigation={Navigation} /> : null }
					{ modalName === 'DirectoryView' ? <DirectoryView navigation={Navigation} /> : null }
				</View>
			</Modal>
		);
	}

	renderSideView = () => {
		const { landscape } = this.state;
		return (
			<>
				<View style={{ flex: landscape ? 4 : 5 }}>
					<ListContainer
						ref={(listRef) => {
							this.listRef = listRef;
						}}
					/>
				</View>
				<View style={{ height: '100%', width: 1, backgroundColor: COLOR_BORDER }} />
			</>
		);
	}

	render() {
		const { inside, inCall, landscape } = this.state;
		return (
			<View
				style={{
					flex: 1,
					flexDirection: 'row'
				}}
			>
				{ this.renderModal() }
				{ inside && !inCall ? this.renderSideView() : null }
				<View style={{ flex: landscape ? 9 : 7 }}>
					<App
						ref={(navigatorRef) => {
							Navigation.setTopLevelNavigator(navigatorRef);
						}}
						onNavigationStateChange={onNavigationStateChange}
					/>
				</View>
			</View>
		);
	}
}

export default class Root extends React.Component {
	constructor(props) {
		super(props);
		this.init();
		this.initCrashReport();
	}

	componentDidMount() {
		this.listenerTimeout = setTimeout(() => {
			Linking.addEventListener('url', ({ url }) => {
				const parsedDeepLinkingURL = parseDeepLinking(url);
				if (parsedDeepLinkingURL) {
					store.dispatch(deepLinkingOpen(parsedDeepLinkingURL));
				}
			});
		}, 5000);
	}

	componentWillUnmount() {
		clearTimeout(this.listenerTimeout);
	}

	init = async() => {
		const [notification, deepLinking] = await Promise.all([initializePushNotifications(), Linking.getInitialURL()]);
		const parsedDeepLinkingURL = parseDeepLinking(deepLinking);
		if (notification) {
			onNotification(notification);
		} else if (parsedDeepLinkingURL) {
			store.dispatch(deepLinkingOpen(parsedDeepLinkingURL));
		} else {
			store.dispatch(appInit());
		}
	}

	initCrashReport = () => {
		RocketChat.getAllowCrashReport()
			.then((allowCrashReport) => {
				if (!allowCrashReport) {
					loggerConfig.autoNotify = false;
					loggerConfig.registerBeforeSendCallback(() => false);
					analytics().setAnalyticsCollectionEnabled(false);
				}
			});
	}

	render() {
		return (
			<Provider store={store}>
				<LayoutAnimation>
					<MasterDetailView />
				</LayoutAnimation>
			</Provider>
		);
	}
}