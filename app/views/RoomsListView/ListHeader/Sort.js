import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { RectButton } from 'react-native-gesture-handler';

import { CustomIcon } from '../../../lib/Icons';
import I18n from '../../../i18n';
import styles from '../styles';
import { themes } from '../../../constants/colors';
import { withTheme } from '../../../theme';


const Sort = React.memo(({
	searchLength, sortBy, toggleSort, theme
}) => {
	if (searchLength > 0) {
		return null;
	}
	return (
		<RectButton
			onPress={toggleSort}
			activeOpacity={1}
			underlayColor={themes[theme].bannerBackground}
		>
			<View
				style={[
					styles.dropdownContainerHeader,
					{ borderBottomWidth: StyleSheet.hairlineWidth, borderColor: themes[theme].separatorColor }
				]}
			>
				<Text style={styles.sortToggleText}>{I18n.t('Sorting_by', { key: I18n.t(sortBy === 'alphabetical' ? 'name' : 'activity') })}</Text>
				<CustomIcon style={styles.sortIcon} size={22} name='sort1' />
			</View>
		</RectButton>
	);
});

Sort.propTypes = {
	searchLength: PropTypes.number,
	sortBy: PropTypes.string,
	toggleSort: PropTypes.func
};

export default withTheme(Sort);
