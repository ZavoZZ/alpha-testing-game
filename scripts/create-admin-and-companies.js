/**
 * Script to create admin user and founder companies
 * Run with: node scripts/create-admin-and-companies.js
 */

require('dotenv').config({ path: '.env.sandbox' });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to MongoDB
const MONGODB_URI = process.env.DB_URI;

// User Schema
const userSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true },
		username: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		role: {
			type: String,
			default: 'user',
			enum: ['user', 'moderator', 'admin'],
		},
		isActive: { type: Boolean, default: true },
		isBanned: { type: Boolean, default: false },
		balance_euro: {
			type: mongoose.Schema.Types.Decimal128,
			default: () => mongoose.Types.Decimal128.fromString('0.0000'),
		},
		balance_gold: {
			type: mongoose.Schema.Types.Decimal128,
			default: () => mongoose.Types.Decimal128.fromString('0.0000'),
		},
		balance_ron: {
			type: mongoose.Schema.Types.Decimal128,
			default: () => mongoose.Types.Decimal128.fromString('0.0000'),
		},
		energy: { type: Number, default: 100 },
		happiness: { type: Number, default: 100 },
	},
	{ timestamps: true },
);

// Company Schema
const companySchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		type: { type: String, default: 'PRIVATE' },
		description: { type: String },
		funds_euro: {
			type: mongoose.Schema.Types.Decimal128,
			default: () => mongoose.Types.Decimal128.fromString('0.0000'),
		},
		funds_gold: {
			type: mongoose.Schema.Types.Decimal128,
			default: () => mongoose.Types.Decimal128.fromString('0.0000'),
		},
		funds_ron: {
			type: mongoose.Schema.Types.Decimal128,
			default: () => mongoose.Types.Decimal128.fromString('0.0000'),
		},
		wage_offer: {
			type: mongoose.Schema.Types.Decimal128,
			default: () => mongoose.Types.Decimal128.fromString('5.0000'),
		},
		min_skill_required: { type: Number, default: 0 },
		max_employees: { type: Number, default: 10 },
		level: { type: Number, default: 1 },
		status: { type: String, default: 'ACTIVE' },
		is_government: { type: Boolean, default: false },
		is_hiring: { type: Boolean, default: true },
	},
	{ timestamps: true },
);

const User = mongoose.model('User', userSchema);
const Company = mongoose.model('Company', companySchema);

// Treasury Schema
const treasurySchema = new mongoose.Schema(
	{
		singleton: { type: Boolean, default: true },
		funds_euro: {
			type: mongoose.Schema.Types.Decimal128,
			default: () => mongoose.Types.Decimal128.fromString('0.0000'),
		},
		funds_gold: {
			type: mongoose.Schema.Types.Decimal128,
			default: () => mongoose.Types.Decimal128.fromString('0.0000'),
		},
		funds_ron: {
			type: mongoose.Schema.Types.Decimal128,
			default: () => mongoose.Types.Decimal128.fromString('0.0000'),
		},
		total_tax_collected_euro: {
			type: mongoose.Schema.Types.Decimal128,
			default: () => mongoose.Types.Decimal128.fromString('0.0000'),
		},
	},
	{ timestamps: true },
);

const Treasury = mongoose.model('Treasury', treasurySchema);

async function createAdminAndCompanies() {
	try {
		console.log('Connecting to MongoDB...');
		await mongoose.connect(MONGODB_URI);
		console.log('✅ Connected to MongoDB');

		// Check if admin exists
		let adminUser = await User.findOne({ role: 'admin' });

		if (!adminUser) {
			console.log('Creating admin user...');
			const hashedPassword = await bcrypt.hash('AdminPass123!', 10);
			adminUser = await User.create({
				email: 'admin@game.test',
				username: 'GameAdmin',
				password: hashedPassword,
				role: 'admin',
				isActive: true,
				balance_euro: mongoose.Types.Decimal128.fromString('1000.0000'),
				energy: 100,
				happiness: 100,
			});
			console.log('✅ Admin user created:', adminUser.username);
		} else {
			console.log('✅ Admin user already exists:', adminUser.username);
		}

		// Check if government company exists
		let govCompany = await Company.findOne({ is_government: true });

		if (!govCompany) {
			console.log('Creating government company...');
			govCompany = await Company.create({
				name: 'State Employment Agency',
				owner_id: adminUser._id,
				type: 'GOVERNMENT',
				description:
					'Government-owned employment agency. Default employer for all citizens.',
				funds_euro: mongoose.Types.Decimal128.fromString('100000.0000'),
				wage_offer: mongoose.Types.Decimal128.fromString('10.0000'),
				min_skill_required: 0,
				max_employees: 10000,
				level: 1,
				status: 'ACTIVE',
				is_government: true,
				is_hiring: true,
			});
			console.log('✅ Government company created:', govCompany.name);
		} else {
			console.log('✅ Government company already exists:', govCompany.name);
		}

		// Create Treasury if not exists
		let treasury = await Treasury.findOne({ singleton: true });
		if (!treasury) {
			console.log('Creating Treasury...');
			treasury = await Treasury.create({
				singleton: true,
				funds_euro: mongoose.Types.Decimal128.fromString('1000000.0000'),
				total_tax_collected_euro:
					mongoose.Types.Decimal128.fromString('0.0000'),
			});
			console.log('✅ Treasury created');
		} else {
			console.log('✅ Treasury already exists');
		}

		// List all companies
		const companies = await Company.find({});
		console.log(`\n📊 Total companies: ${companies.length}`);
		companies.forEach((c) => {
			console.log(`   - ${c.name} (Government: ${c.is_government})`);
		});

		// List all users
		const users = await User.find({});
		console.log(`\n👥 Total users: ${users.length}`);
		users.forEach((u) => {
			console.log(`   - ${u.username} (${u.role})`);
		});

		await mongoose.disconnect();
		console.log('\n✅ Done!');
		process.exit(0);
	} catch (error) {
		console.error('❌ Error:', error);
		process.exit(1);
	}
}

createAdminAndCompanies();
