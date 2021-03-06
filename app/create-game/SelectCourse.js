import React from 'react';
import { connect } from 'react-redux';
import { ScrollView, ListView, StyleSheet } from 'react-native';
import { Button, ListItem, Radio, Right } from 'native-base';
import styled from 'styled-components/native';
import PropTypes from 'prop-types';

import BaseText from '../shared/components/BaseText';
import styles from './styles/SelectCourseStyles';
import { ColorPalette } from '../themes';


const Container = styled.View`
  flex: 1;
`;

const HorizontallyCentered = styled.View`
  flex-direction: row;
  justify-content: center;
`;

const Text = styled(BaseText)`
  color: ${ColorPalette.text}
`;

const ButtonText = styled(BaseText)`
  color: ${ColorPalette.primary.text}
`;

class SelectCourse extends React.Component {
  constructor(props) {
    super(props);
    this.renderRow = this.renderRow.bind(this);
    this.courseSelected = this.courseSelected.bind(this);
  }

  getSelectedCourse() {
    if (this.state && this.state.selectedCourse) {
      return this.state.selectedCourse;
    }
    return null;
  }

  courseSelected() {
    if (this.state.selectedCourse) {
      this.props.courseSelected(this.state.selectedCourse);
    }
  }

  handleSelection(course) {
    this.setState({
      selectedCourse: course
    });
  }

  renderRow(rowData) {
    const selected = this.state && this.state.selectedCourse &&
            this.state.selectedCourse.id === rowData.id;
    return (
      <ListItem onPress={() => this.handleSelection(rowData)}>
        <Text>{rowData.name}</Text>
        <Right>
          <Radio selected={selected} />
        </Right>
      </ListItem>
    );
  }

  render() {
    const dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    }).cloneWithRows(this.props.courses);
    const isCourseSelected = this.state && this.state.courseSelected !== null;
    return (
      <Container>
        <ScrollView>
          <ListView
            dataSource={dataSource}
            renderRow={this.renderRow}
            enableEmptySections
          />
        </ScrollView>
        <HorizontallyCentered>
          <Button
            disabled={!isCourseSelected}
            style={StyleSheet.flatten(styles.button)}
            onPress={this.courseSelected}
          >
            <ButtonText>Continue</ButtonText>
          </Button>
        </HorizontallyCentered>
      </Container>
    );
  }
}

SelectCourse.propTypes = {
  courseSelected: PropTypes.func.isRequired,
  courses: PropTypes.array.isRequired
};

const mapStateToProps = (state) => ({
  courses: state.courses
});

export default connect(mapStateToProps)(SelectCourse);
