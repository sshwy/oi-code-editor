// Copyright 2024 Weiyao Huang
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//! This module contains the logic for rating calculation and modification.
//!
//! refs:
//! - <https://codeforces.com/blog/entry/102>
//! - <https://codeforces.com/blog/entry/20762>

use std::collections::BTreeMap;

pub trait RatingChanger {
    /// The rank of the participant in the competition. Duplicate ranks are
    /// allowed. Converted to f64 for easier calculation.
    fn rank(&self) -> f64;
    /// The rating of the participant before the competition.
    fn rating(&self) -> i32;
    /// The epoch of the participant.
    fn epoch(&self) -> u32;
    /// Set the rating change for the participant.
    fn set_delta(&mut self, delta: i32);
    /// Get the delta
    fn delta(&self) -> i32;
}

/// Calculate the expected score (probability of player 1 winning against player
/// 2) based on their ratings before the match.
fn calc_percentage(p1: i32, p2: i32) -> f64 {
    1.0 / (1.0 + f64::powf(10., ((p2 - p1) as f64) / 400.))
}

/// Seed is the place that the participant is expected to take in this
/// competition, which is the sum of probabilities of beaten by other
/// participants plus 1.
fn calc_seed<T: RatingChanger>(players: &[T], ri: i32, i: usize) -> f64 {
    players
        .iter()
        .enumerate()
        .filter_map(|(j, c)| (j != i).then_some(calc_percentage(c.rating(), ri)))
        .sum::<f64>()
        + 1.
}

/// Using binary search find such rating value R which the i-th
/// participant should have to have a seed[i] = m[i].
fn expected_rating<T: RatingChanger>(players: &[T], i: usize, mi: f64) -> i32 {
    let (mut l, mut r) = (RATING_MIN, RATING_MAX);
    while l < r {
        let mid = (l + r) >> 1; // floor division by 2

        // if seed is too large, then the estimated rating is too small
        if calc_seed(players, mid, i) >= mi {
            l = mid + 1;
        } else {
            r = mid;
        }
    }
    l
}

pub const RATING_MAX: i32 = 10000;
pub const RATING_MIN: i32 = -10000;
pub const EPOCH_DECAY: f64 = 0.96;

/// ## Epoch-aware Elo rating calculation
///
/// This algorithm is an extension of the Codeforces Elo rating system,
/// behaving identically to the original algorithm when epochs are not
/// considered.
///
/// Given a list of players ordered by their rank, this function calculates
/// the rating change for each participant and sets it using
/// [`RatingChanger::set_delta`].
///
/// `k` determines the magnitude of change. The coefficient applied to the delta
/// is calculated as follows:
///
/// 1. If `k < 1`, the coefficient is `max(0, k)`.
/// 2. Otherwise, the coefficient is `2 - k^(-0.5)`.
///
/// The rank is assumed to be `index + 1`.
///
/// To prevent high-epoch users from gaining points at the expense of low-epoch
/// users, we apply a bias to the delta of each epoch. The bias is the average
/// delta of all users in the same or earlier epochs.
pub fn set_deltas<T: RatingChanger>(players: &mut [T], k: f64) {
    let mut means = Vec::new();
    for i in 0..players.len() {
        let r = players[i].rating();
        let seed = calc_seed(players, r, i);
        let mi = f64::sqrt(seed * players[i].rank());
        means.push(mi);
    }

    // d[i] is the rating change for the i-th participant.
    let mut d: Vec<(u32, f64)> = means
        .into_iter()
        .enumerate()
        .map(|(i, mi)| {
            let ri = expected_rating(players, i, mi);
            let d = ri - players[i].rating();
            (players[i].epoch(), d as f64 / 2.)
        })
        .collect();

    // epoch -> (cnt, sum)
    let mut ep_delta_bias: BTreeMap<u32, (i32, f64)> =
        d.iter().fold(BTreeMap::new(), |mut h, (ep, delta)| {
            let (cnt, sum) = h.entry(*ep).or_default();
            *cnt += 1;
            *sum += *delta;
            h
        });

    // do a prefix sum
    let keys: Vec<u32> = ep_delta_bias.keys().copied().collect();
    for (a, b) in keys.iter().zip(keys.iter().skip(1)) {
        let (cnt_a, sum_a) = ep_delta_bias[a];
        let (cnt, sum) = ep_delta_bias.get_mut(b).unwrap();
        *cnt += cnt_a;
        *sum += sum_a;
    }

    // calculate bias for each epoch
    let ep_delta_bias: BTreeMap<u32, f64> = ep_delta_bias
        .into_iter()
        .map(|(ep, (cnt, sum))| (ep, sum / cnt as f64))
        .collect();

    // calculate the final delta
    for (ep, x) in &mut d {
        *x -= ep_delta_bias[ep];
    }

    let coef = if k < 1. {
        f64::max(0., k)
    } else {
        2. - f64::powf(k, -0.5)
    };

    // set the delta values
    // while CodeForces implements a second adjustment, we don't need it here.
    // because the amount of participants is not so large.
    for i in 0..players.len() {
        let (ep, x) = d[i];
        let delta = x * coef;
        // apply epoch decay 实际上由于非0纪元的 rating delta 是无中生有的，
        // epoch decay 某种程度上可以抑制通货膨胀
        let delta = if delta < 0. {
            delta
        } else {
            delta * EPOCH_DECAY.powf(ep as f64)
        };
        players[i].set_delta(delta.round_ties_even() as i32);
    }
}

/// `RATING_BONUS[i]` means, if the user has participated in a total number of
/// i contests, then the user will get a b[onus of `RATING_BONUS[min(i, 6)]`
/// points.
///
/// This array should be in consistent with the `user_rating.bonused_rating` in
/// database schema.
pub const RATING_BONUS: [i32; 7] = [0, 600, 950, 1200, 1350, 1450, 1500];