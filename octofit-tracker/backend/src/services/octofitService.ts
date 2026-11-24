import { Activity, Team, User, Workout } from '../models/index.js';
import mongoose from 'mongoose';

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function isObjectId(value: unknown): value is string {
  return typeof value === 'string' && mongoose.Types.ObjectId.isValid(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(_input: unknown) {
  const input = _input as Record<string, unknown>;
  const userId = input?.userId;
  const teamId = input?.teamId;
  if (!isObjectId(userId) || !isObjectId(teamId) || typeof input.type !== 'string' || typeof input.minutes !== 'number') {
    throw httpError(400, 'Valid userId, teamId, type, and minutes are required');
  }
  const [user, team] = await Promise.all([
    User.findById(userId).lean(),
    Team.findById(teamId).lean(),
  ]);
  if (!user || !team) throw httpError(404, 'User or team not found');

  const activity = await Activity.create({
    user: userId,
    team: teamId,
    type: input.type,
    minutes: input.minutes,
    points: input.minutes,
    occurredAt: new Date(),
  });
  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(_input: unknown) {
  const input = _input as Record<string, unknown>;
  if (!input || typeof input.name !== 'string' || input.name.trim().length === 0) {
    throw httpError(400, 'Team name is required');
  }
  const members = Array.isArray(input.members) ? input.members : [];
  if (members.some((member) => !isObjectId(member))) {
    throw httpError(400, 'Team members must be valid user IDs');
  }
  const team = await Team.create({
    name: input.name.trim(),
    mascot: typeof input.mascot === 'string' ? input.mascot : '',
    members,
  });
  return team.toObject();
}

export async function getLeaderboard() {
  const teams = await Team.find().lean();
  const entries = await Promise.all(teams.map(async (team) => {
    const activities = await Activity.find({ team: team._id }).select('points').lean();
    return {
      teamName: team.name,
      totalPoints: activities.reduce((sum, activity) => sum + (activity.points ?? 0), 0),
    };
  }));
  return entries
    .filter((entry) => entry.totalPoints > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(_userEmail: string) {
  const user = await User.findOne({ email: _userEmail }).lean();
  if (!user) throw httpError(404, 'User not found');

  const recentActivities = await Activity.find({ user: user._id })
    .sort({ occurredAt: -1 })
    .limit(5)
    .lean();
  const focus = recentActivities[0]?.type
    ? String(recentActivities[0].type)
    : user.fitnessGoal;
  const workouts = await Workout.find().lean();
  const matching = workouts.filter((workout) =>
    workout.focus === focus || workout.focus === user.fitnessGoal,
  );
  const selected = matching.length > 0 ? matching : workouts;
  return selected.map((workout) => ({
    ...workout,
    reason: `Matches ${focus} from your recent activity and fitness goal ${user.fitnessGoal}.`,
  }));
}

export { User };
