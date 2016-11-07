import * as _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ScrollView, View } from 'react-native';

import { updateScore } from '../actions/actionCreators';
import ScoregridElement from './ScoregridElement';

const marginStyle = {
    marginTop: 10,
    flex: 1
};

class ScoreGrid extends React.Component {
    constructor(props) {
        super(props);
        this.getPlayingOrders = this.getPlayingOrders.bind(this);
    }

    getScore(player) {
        const scoreList = _.values(this.props.game.scores);
        return _.find(scoreList, (score) =>
            score.player.id === player.id &&
            score.hole.holenumber === this.props.game.currentHole
        );
    }

    getPlayingOrders() {
        const nextOrdering = (holeOrder, holeScores) => {
            const grouped = _.groupBy(holeScores, 'score');
            if (Object.keys(grouped).length === 1) {
                return holeOrder;
            }

            let currentOrder = 1;
            const order = {};

            // Loop through each distinct score group and set the correct
            // ordering. Keep the order correct among players in the same
            // score group
            _.values(grouped).forEach((group) => {
                const sortedOrdering = _.chain(group)
                    .map((s) => ({
                        playerId: s.player.id,
                        order: holeOrder[s.player.id]
                    }))
                    .sortBy('order')
                    .value();
                sortedOrdering.forEach((obj) => {
                    order[obj.playerId] = currentOrder++;
                });
            });

            return order;
        };

        // First hole order is always default
        const firstHoleScores = {};
        _.values(this.props.game.players).forEach((player, index) => {
            firstHoleScores[player.id] = index + 1;
        });

        const ordering = { 1: firstHoleScores };
        const holeCount = _.values(this.props.game.course.holes).length;
        _.range(2, holeCount + 1).forEach((holeNumber) => {
            const previousOrdering = ordering[holeNumber - 1];
            const previousScores = _.values(this.props.game.scores).filter(
                (score) => score.hole.holenumber === (holeNumber - 1)
            );
            const next = nextOrdering(previousOrdering, previousScores);
            ordering[holeNumber] = next;
        });

        return ordering;
    }

    render() {
        const ordering = this.getPlayingOrders();
        const scoreGridElements = _.values(this.props.game.players).map(
            (p, index) => {
                const score = this.getScore(p);
                const highlighted = this.props.activePlayer &&
                    p.id === this.props.activePlayer.id;

                const order = ordering[this.props.game.currentHole][p.id];

                return (<ScoregridElement
                  onPress={() => this.props.activePlayerSelected(p)}
                  highlighted={highlighted}
                  order={order}
                  player={p}
                  key={index}
                  score={score.score}
                />);
            }
        );
        return (<View style={marginStyle}>
          <ScrollView>
            {scoreGridElements}
          </ScrollView>
        </View>);
    }
}

ScoreGrid.propTypes = {
    scores: React.PropTypes.object.isRequired,
    players: React.PropTypes.object.isRequired,
    hole: React.PropTypes.number.isRequired,
    updateScore: React.PropTypes.func.isRequired,
    gameId: React.PropTypes.number.isRequired,
    game: React.PropTypes.object.isRequired,
    activePlayerSelected: React.PropTypes.func.isRequired,
    activePlayer: React.PropTypes.object.isRequired
};

const mapDispatchToProps = (dispatch) => ({
    updateScore: bindActionCreators(updateScore, dispatch)
});

export default connect(null, mapDispatchToProps)(ScoreGrid);
