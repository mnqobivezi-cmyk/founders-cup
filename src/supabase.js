// ─── FOUNDERS CUP — SUPABASE SERVICE LAYER ───────────────────────────────────
// src/supabase.js
// All database reads and writes go through this file.
// The app calls these functions instead of managing local state directly.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL     = 'https://ftlivzbxotabkfbxmgnk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bGl2emJ4b3RhYmtmYnhtZ25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjY5NDYsImV4cCI6MjA5MTA0Mjk0Nn0.8RhQh1RusJrmy13DMWqRPXWV9h9vsFFpiZc9W8XpnV4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── HELPERS ──────────────────────────────────────────────────────────────────
async function getActiveEventId() {
  const { data, error } = await supabase
    .from('fc_events')
    .select('id')
    .eq('is_active', true)
    .single();
  if (error) throw error;
  return data.id;
}

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────
export async function fetchAnnouncements() {
  const eid = await getActiveEventId();
  const { data, error } = await supabase
    .from('fc_announcements')
    .select('*')
    .eq('event_id', eid)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function postAnnouncement(body, urgent = false) {
  const eid = await getActiveEventId();
  const { data, error } = await supabase
    .from('fc_announcements')
    .insert({ event_id: eid, body, urgent, posted_by: 'Organizer' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAnnouncement(id) {
  const { error } = await supabase
    .from('fc_announcements')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ─── TEAMS ────────────────────────────────────────────────────────────────────
export async function fetchTeams(competition) {
  const eid = await getActiveEventId();
  const { data, error } = await supabase
    .from('fc_teams')
    .select('*, fc_players(*)')
    .eq('event_id', eid)
    .eq('competition', competition);
  if (error) throw error;
  return data;
}

// ─── PLAYERS ──────────────────────────────────────────────────────────────────
export async function addPlayer(teamId, player) {
  const { data, error } = await supabase
    .from('fc_players')
    .insert({
      team_id:      teamId,
      name:         `${player.firstName} ${player.lastName}`,
      first_name:   player.firstName,
      last_name:    player.lastName,
      jersey_number: player.jersey,
      position:     player.position,
      age_group:    player.ageGroup,
      branch:       player.branch,
      id_number:    player.idNumber,
      phone:        player.phone,
      member_since: player.memberSince || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePlayer(playerId) {
  const { error } = await supabase
    .from('fc_players')
    .delete()
    .eq('id', playerId);
  if (error) throw error;
}

// ─── MATCHES ──────────────────────────────────────────────────────────────────
export async function fetchMatches(competition) {
  const eid = await getActiveEventId();
  const { data, error } = await supabase
    .from('fc_matches_view')
    .select('*')
    .eq('event_id', eid)
    .eq('competition', competition)
    .order('round', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createMatches(competition, matchList) {
  const eid = await getActiveEventId();
  const rows = matchList.map(m => ({
    event_id:    eid,
    competition,
    round:       m.round,
    team_a_id:   m.teamA,
    team_b_id:   m.teamB === 'tbd' ? null : m.teamB,
    status:      'pending',
    published:   false,
  }));
  const { data, error } = await supabase
    .from('fc_matches')
    .insert(rows)
    .select();
  if (error) throw error;
  return data;
}

export async function updateMatchScore(matchId, scoreA, scoreB) {
  const { error } = await supabase
    .from('fc_matches')
    .update({ score_a: scoreA, score_b: scoreB })
    .eq('id', matchId);
  if (error) throw error;
}

export async function confirmMatchResult(matchId, winnerId) {
  const { error } = await supabase
    .from('fc_matches')
    .update({ winner_id: winnerId, status: 'completed' })
    .eq('id', matchId);
  if (error) throw error;
}

export async function advanceWinner(competition, round, winnerId) {
  const eid = await getActiveEventId();
  // Check if a next-round match with a TBD slot exists
  const { data: existing } = await supabase
    .from('fc_matches')
    .select('*')
    .eq('event_id', eid)
    .eq('competition', competition)
    .eq('round', round + 1)
    .is('team_b_id', null)
    .maybeSingle();

  if (existing) {
    // Fill the empty slot
    const { error } = await supabase
      .from('fc_matches')
      .update({ team_b_id: winnerId })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    // Create a new next-round match
    const { error } = await supabase
      .from('fc_matches')
      .insert({
        event_id:  eid,
        competition,
        round:     round + 1,
        team_a_id: winnerId,
        status:    'pending',
        published: false,
      });
    if (error) throw error;
  }
}

export async function deleteMatch(matchId) {
  const { error } = await supabase
    .from('fc_matches')
    .delete()
    .eq('id', matchId);
  if (error) throw error;
}

// ─── PUBLISH FLAGS ────────────────────────────────────────────────────────────
export async function fetchPublishFlags() {
  const eid = await getActiveEventId();
  const { data, error } = await supabase
    .from('fc_publish_flags')
    .select('*')
    .eq('event_id', eid);
  if (error) throw error;
  // Return as { soccer: bool, netball: bool, choir: bool }
  return data.reduce((acc, row) => {
    acc[row.competition] = row.published;
    return acc;
  }, {});
}

export async function setPublished(competition, published) {
  const eid = await getActiveEventId();
  const { error } = await supabase
    .from('fc_publish_flags')
    .update({ published, updated_at: new Date().toISOString() })
    .eq('event_id', eid)
    .eq('competition', competition);
  if (error) throw error;
}

// ─── CHOIR GROUPS ─────────────────────────────────────────────────────────────
export async function fetchChoirGroups() {
  const eid = await getActiveEventId();
  const { data, error } = await supabase
    .from('fc_choir_groups')
    .select('*')
    .eq('event_id', eid)
    .order('performance_order', { ascending: true, nullsLast: true });
  if (error) throw error;
  return data;
}

// ─── CHOIR SCORES ─────────────────────────────────────────────────────────────
export async function fetchChoirScores() {
  const eid = await getActiveEventId();
  const { data, error } = await supabase
    .from('fc_choir_scores')
    .select('*')
    .eq('event_id', eid);
  if (error) throw error;
  return data;
}

export async function upsertChoirScore(groupId, judgeName, category, score) {
  const eid = await getActiveEventId();
  const { error } = await supabase
    .from('fc_choir_scores')
    .upsert({
      event_id:   eid,
      group_id:   groupId,
      judge_name: judgeName,
      category,
      score,
      submitted_at: new Date().toISOString(),
    }, { onConflict: 'group_id,judge_name,category' });
  if (error) throw error;
}

// ─── CHOIR LEADERBOARD VIEW ───────────────────────────────────────────────────
export async function fetchChoirLeaderboard() {
  const eid = await getActiveEventId();
  const { data, error } = await supabase
    .from('fc_choir_leaderboard')
    .select('*')
    .eq('event_id', eid);
  if (error) throw error;
  return data;
}

// ─── JUDGES (stored in fc_team_admins table with role='judge') ────────────────
// We store judges and team admins in localStorage since they are setup-only
// and don't need cross-device sync in the same way game data does.
// They can be moved to Supabase in a future version.

// ─── VOTING ───────────────────────────────────────────────────────────────────
// Voting is kept in localStorage for now since it's per-device by design
// (one vote per device per match). Can be moved to Supabase later with
// proper voter identity via phone number or email verification.

// ─── REALTIME SUBSCRIPTIONS ───────────────────────────────────────────────────
export function subscribeToMatches(competition, callback) {
  return supabase
    .channel(`matches_${competition}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'fc_matches',
      filter: `competition=eq.${competition.toLowerCase()}`,
    }, callback)
    .subscribe();
}

export function subscribeToAnnouncements(callback) {
  return supabase
    .channel('announcements')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'fc_announcements',
    }, callback)
    .subscribe();
}

export function subscribeToChoirScores(callback) {
  return supabase
    .channel('choir_scores')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'fc_choir_scores',
    }, callback)
    .subscribe();
}

export function subscribeToPublishFlags(callback) {
  return supabase
    .channel('publish_flags')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'fc_publish_flags',
    }, callback)
    .subscribe();
}

export function unsubscribe(channel) {
  if (channel) supabase.removeChannel(channel);
}

// ─── CHAMPIONS VIEW ───────────────────────────────────────────────────────────
export async function fetchChampions() {
  const eid = await getActiveEventId();
  const { data, error } = await supabase
    .from('fc_champions')
    .select('*')
    .eq('event_id', eid);
  if (error) throw error;
  return data;
}

// ─── RESET (organizer only) ───────────────────────────────────────────────────
export async function resetCompetition(competition) {
  const eid = await getActiveEventId();
  if (competition === 'choir') {
    await supabase.from('fc_choir_scores').delete().eq('event_id', eid);
  } else {
    await supabase.from('fc_matches').delete().eq('event_id', eid).eq('competition', competition);
    await supabase.from('fc_players').delete().in(
      'team_id',
      (await supabase.from('fc_teams').select('id').eq('event_id', eid).eq('competition', competition)).data.map(t => t.id)
    );
  }
  await setPublished(competition, false);
}
