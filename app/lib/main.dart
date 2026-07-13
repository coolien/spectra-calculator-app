import 'package:flutter/material.dart';
import 'package:loancalculator/src/app_build_info.dart';
import 'package:loancalculator/src/app_preferences.dart';
import 'package:loancalculator/src/calculators/consumer_loan_calculators.dart';
import 'package:loancalculator/src/calculators/home_loan_calculator.dart';
import 'package:loancalculator/src/calculators/salary_planner_calculator.dart';
import 'package:loancalculator/src/ongoing_loans.dart';
import 'package:loancalculator/src/personal_finance_profile.dart';
import 'package:loancalculator/src/saved_scenarios.dart';
import 'package:loancalculator/src/supabase/spectra_auth_repository.dart';
import 'package:loancalculator/src/supabase/spectra_cloud_sync_repository.dart';
import 'package:loancalculator/src/supabase/spectra_supabase_config.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SpectraSupabaseConfig.initialize();
  runApp(const LoanCalculatorApp());
}

class LoanCalculatorApp extends StatelessWidget {
  const LoanCalculatorApp({super.key});

  @override
  Widget build(BuildContext context) {
    const seedColor = Color(0xFF35C79A);

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Spectra',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: seedColor,
          brightness: Brightness.light,
        ),
        scaffoldBackgroundColor: const Color(0xFFF7F4EF),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}

const _homeLoanAccent = Color(0xFF35C79A);
const _carLoanAccent = Color(0xFF4C82F7);
const _personalLoanAccent = Color(0xFFA667F5);
const _creditCardAccent = Color(0xFFFF5D6C);
const _ptptnAccent = Color(0xFFFFB443);
const _profileAccent = Color(0xFF6B6874);

Color savedScenarioAccent(SavedScenarioType type) {
  return switch (type) {
    SavedScenarioType.homeLoan => _homeLoanAccent,
    SavedScenarioType.carLoan => _carLoanAccent,
    SavedScenarioType.personalLoan => _personalLoanAccent,
    SavedScenarioType.creditCard => _creditCardAccent,
    SavedScenarioType.ptptnLoan => _ptptnAccent,
  };
}

Color ongoingLoanAccent(OngoingLoanType type) {
  return switch (type) {
    OngoingLoanType.home => _homeLoanAccent,
    OngoingLoanType.car => _carLoanAccent,
    OngoingLoanType.personal => _personalLoanAccent,
    OngoingLoanType.creditCard => _creditCardAccent,
    OngoingLoanType.ptptn => _ptptnAccent,
    OngoingLoanType.other => _profileAccent,
  };
}

IconData ongoingLoanIcon(OngoingLoanType type) {
  return switch (type) {
    OngoingLoanType.home => Icons.home_work_outlined,
    OngoingLoanType.car => Icons.directions_car_outlined,
    OngoingLoanType.personal => Icons.account_balance_wallet_outlined,
    OngoingLoanType.creditCard => Icons.credit_card_outlined,
    OngoingLoanType.ptptn => Icons.school_outlined,
    OngoingLoanType.other => Icons.receipt_long_outlined,
  };
}

void showInfoDialog(
  BuildContext context, {
  required String title,
  required String message,
}) {
  showDialog<void>(
    context: context,
    builder: (context) => AlertDialog(
      title: Text(title),
      content: Text(message),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('OK'),
        ),
      ],
    ),
  );
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _dashboardRefresh = 0;

  Future<void> _openPersonalProfile() async {
    await Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => const PersonalProfileScreen()),
    );
    if (mounted) {
      setState(() {
        _dashboardRefresh += 1;
      });
    }
  }

  Future<void> _openOverallLoans() async {
    await Navigator.of(
      context,
    ).push(MaterialPageRoute<void>(builder: (_) => const OverallLoansScreen()));
    if (mounted) {
      setState(() {
        _dashboardRefresh += 1;
      });
    }
  }

  Future<void> _openLanguage() async {
    await Navigator.of(
      context,
    ).push(MaterialPageRoute<void>(builder: (_) => const LanguageScreen()));
  }

  Future<void> _openAccountSync() async {
    await Navigator.of(
      context,
    ).push(MaterialPageRoute<void>(builder: (_) => const AccountSyncScreen()));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      drawer: const AppNavigationDrawer(),
      appBar: AppBar(
        title: const Text('Spectra'),
        centerTitle: false,
        actions: [
          IconButton(
            tooltip: 'Language',
            icon: const Icon(Icons.translate_outlined),
            onPressed: _openLanguage,
          ),
          IconButton(
            tooltip: 'Account and sync',
            icon: const Icon(Icons.account_circle_outlined),
            onPressed: _openAccountSync,
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          children: [
            Text(
              'Loan planner',
              style: theme.textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Build your profile once, then compare loan decisions with clearer monthly cashflow.',
              style: theme.textTheme.bodyLarge?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 16),
            const AccountSyncPromptCard(),
            const SizedBox(height: 20),
            HomeDashboardSnapshot(key: ValueKey(_dashboardRefresh)),
            const SizedBox(height: 12),
            SectionPanel(
              title: 'Personal workspace',
              icon: Icons.route_outlined,
              children: [
                Text(
                  'Recommended first-time flow: set your profile, add active loans, then use calculators to test new decisions.',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 12),
                SetupStepRow(
                  step: '1',
                  title: 'Create Personal Profile',
                  subtitle: 'Salary, deductions, expenses, savings and DSR.',
                  icon: Icons.person_outline,
                  onTap: _openPersonalProfile,
                ),
                SetupStepRow(
                  step: '2',
                  title: 'Add Overall Loans',
                  subtitle: 'Track active monthly commitments and balances.',
                  icon: Icons.account_balance_wallet_outlined,
                  onTap: _openOverallLoans,
                ),
                const SetupStepRow(
                  step: '3',
                  title: 'Choose a Calculator',
                  subtitle:
                      'Home, car, personal, card and PTPTN tools are below.',
                  icon: Icons.calculate_outlined,
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    FilledButton.icon(
                      onPressed: _openPersonalProfile,
                      icon: const Icon(Icons.person_outline),
                      label: const Text('Personal profile'),
                    ),
                    OutlinedButton.icon(
                      onPressed: _openOverallLoans,
                      icon: const Icon(Icons.account_balance_wallet_outlined),
                      label: const Text('Overall loans'),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 20),
            CalculatorModuleCard(
              title: 'Home Loan',
              status: 'v1',
              description:
                  'Estimate monthly installment, upfront cash, stamp duty, and fee breakdown.',
              icon: Icons.home_work_outlined,
              accentColor: _homeLoanAccent,
              isActive: true,
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const HomeLoanScreen(),
                  ),
                );
              },
            ),
            const SizedBox(height: 12),
            CalculatorModuleCard(
              title: 'Car Loan',
              status: 'Beta',
              description: 'Hire purchase flat-rate installment planning.',
              icon: Icons.directions_car_outlined,
              accentColor: _carLoanAccent,
              isActive: true,
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const CarLoanScreen(),
                  ),
                );
              },
            ),
            const SizedBox(height: 12),
            CalculatorModuleCard(
              title: 'Personal Loan',
              status: 'Beta',
              description: 'Reducing-balance repayment and total cost checks.',
              icon: Icons.account_balance_wallet_outlined,
              accentColor: _personalLoanAccent,
              isActive: true,
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const PersonalLoanScreen(),
                  ),
                );
              },
            ),
            const SizedBox(height: 12),
            CalculatorModuleCard(
              title: 'Credit Card',
              status: 'Beta',
              description:
                  'Payoff timeline, finance charge, and minimum payment check.',
              icon: Icons.credit_card_outlined,
              accentColor: _creditCardAccent,
              isActive: true,
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const CreditCardScreen(),
                  ),
                );
              },
            ),
            const SizedBox(height: 12),
            CalculatorModuleCard(
              title: 'PTPTN Loan',
              status: 'Beta',
              description:
                  'Education loan repayment and editable Ujrah planning.',
              icon: Icons.school_outlined,
              accentColor: _ptptnAccent,
              isActive: true,
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const PtptnLoanScreen(),
                  ),
                );
              },
            ),
            const SizedBox(height: 20),
            const VersionNote(),
          ],
        ),
      ),
    );
  }
}

class SetupStepRow extends StatelessWidget {
  const SetupStepRow({
    super.key,
    required this.step,
    required this.title,
    required this.subtitle,
    required this.icon,
    this.onTap,
  });

  final String step;
  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: Colors.transparent,
        child: ListTile(
          onTap: onTap,
          dense: true,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 8,
            vertical: 4,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: BorderSide(color: theme.colorScheme.outlineVariant),
          ),
          leading: CircleAvatar(
            radius: 18,
            backgroundColor: theme.colorScheme.secondaryContainer,
            foregroundColor: theme.colorScheme.onSecondaryContainer,
            child: Text(
              step,
              style: const TextStyle(fontWeight: FontWeight.w800),
            ),
          ),
          title: Text(
            title,
            style: const TextStyle(fontWeight: FontWeight.w800),
          ),
          subtitle: Text(subtitle),
          trailing: onTap == null
              ? Icon(icon, color: theme.colorScheme.onSurfaceVariant)
              : const Icon(Icons.chevron_right),
        ),
      ),
    );
  }
}

class HomeDashboardSnapshot extends StatelessWidget {
  const HomeDashboardSnapshot({super.key});

  Future<({PersonalFinanceProfile? profile, List<OngoingLoanCommitment> loans})>
  _load() async {
    final profile = await PersonalFinanceProfileRepository().load();
    final loans = await OngoingLoanRepository().loadAll();
    return (profile: profile, loans: loans);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<
      ({PersonalFinanceProfile? profile, List<OngoingLoanCommitment> loans})
    >(
      future: _load(),
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const SectionPanel(
            title: 'Today snapshot',
            icon: Icons.insights_outlined,
            children: [LinearProgressIndicator()],
          );
        }

        final data = snapshot.data;
        final profile = data?.profile;
        final loans = data?.loans ?? const <OngoingLoanCommitment>[];

        if (profile == null) {
          return SectionPanel(
            title: 'Today snapshot',
            icon: Icons.insights_outlined,
            children: [
              Text(
                'Add your Personal Profile to see take-home pay, DSR, savings room, and monthly loan pressure here.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 10),
              const LoanColorLegend(),
            ],
          );
        }

        final totalMonthlyLoans = loans.fold(
          0.0,
          (sum, loan) => sum + loan.monthlyPayment,
        );
        final result = const SalaryPlannerCalculator().calculate(
          SalaryPlannerInput(
            grossMonthlySalary: profile.grossMonthlySalary,
            epfEmployeeRatePercent: profile.epfEmployeeRatePercent,
            socsoEmployeeRatePercent: profile.socsoEmployeeRatePercent,
            eisEmployeeRatePercent: profile.eisEmployeeRatePercent,
            socialSecurityWageCeiling: profile.socialSecurityWageCeiling,
            monthlyPcbTax: profile.monthlyPcbTax,
            existingMonthlyCommitments: profile.existingMonthlyCommitments,
            monthlyLivingExpenses: profile.monthlyLivingExpenses,
            targetSavingsPercent: profile.targetSavingsPercent,
            targetDsrPercent: profile.targetDsrPercent,
            loanInstallmentToEvaluate: totalMonthlyLoans,
          ),
        );

        return SectionPanel(
          title: 'Today snapshot',
          icon: Icons.insights_outlined,
          children: [
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                ResultMetric(
                  label: 'Take-home',
                  value: formatMyr(result.netMonthlyIncome),
                ),
                ResultMetric(
                  label: 'Listed loans',
                  value: formatMyr(totalMonthlyLoans),
                ),
                ResultMetric(
                  label: 'DSR with loans',
                  value: formatPercent(result.dsrAfterNewLoanPercent),
                ),
                ResultMetric(
                  label: 'After savings',
                  value: formatMyr(result.remainingAfterSavingsTarget),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Tip: keep fixed commitments in Personal Profile and active loan accounts in Overall Loans without double-counting the same payment.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 10),
            const LoanColorLegend(),
          ],
        );
      },
    );
  }
}

class LoanColorLegend extends StatelessWidget {
  const LoanColorLegend({super.key});

  @override
  Widget build(BuildContext context) {
    return const Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        LoanColorChip(
          label: 'Home',
          icon: Icons.home_work_outlined,
          color: _homeLoanAccent,
        ),
        LoanColorChip(
          label: 'Car',
          icon: Icons.directions_car_outlined,
          color: _carLoanAccent,
        ),
        LoanColorChip(
          label: 'Personal',
          icon: Icons.account_balance_wallet_outlined,
          color: _personalLoanAccent,
        ),
        LoanColorChip(
          label: 'Card',
          icon: Icons.credit_card_outlined,
          color: _creditCardAccent,
        ),
        LoanColorChip(
          label: 'PTPTN',
          icon: Icons.school_outlined,
          color: _ptptnAccent,
        ),
      ],
    );
  }
}

class LoanColorChip extends StatelessWidget {
  const LoanColorChip({
    super.key,
    required this.label,
    required this.icon,
    required this.color,
  });

  final String label;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withValues(alpha: 0.30)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 5),
          Text(
            label,
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: color,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class AccountSyncPromptCard extends StatefulWidget {
  const AccountSyncPromptCard({super.key});

  @override
  State<AccountSyncPromptCard> createState() => _AccountSyncPromptCardState();
}

class _AccountSyncPromptCardState extends State<AccountSyncPromptCard> {
  final _preferences = AppPreferenceRepository();
  late Future<bool> _isDismissedFuture;

  @override
  void initState() {
    super.initState();
    _isDismissedFuture = _preferences.isAccountPromptDismissed();
  }

  Future<void> _dismiss() async {
    await _preferences.saveAccountPromptDismissed(true);
    if (!mounted) {
      return;
    }

    setState(() {
      _isDismissedFuture = Future.value(true);
    });
  }

  Future<void> _openSyncSetup() async {
    await Navigator.of(
      context,
    ).push(MaterialPageRoute<void>(builder: (_) => const AccountSyncScreen()));
    if (!mounted) {
      return;
    }

    setState(() {
      _isDismissedFuture = _preferences.isAccountPromptDismissed();
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return FutureBuilder<bool>(
      future: _isDismissedFuture,
      builder: (context, snapshot) {
        if (snapshot.data == true) {
          return const SizedBox.shrink();
        }

        return DecoratedBox(
          decoration: BoxDecoration(
            color: colorScheme.surface,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: colorScheme.outlineVariant),
          ),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: colorScheme.primary.withValues(alpha: 0.10),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        Icons.account_circle_outlined,
                        color: colorScheme.primary,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Account and sync',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    IconButton(
                      tooltip: 'Close',
                      onPressed: _dismiss,
                      icon: const Icon(Icons.close_outlined),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  'Cloud sync is available with a Spectra account. You can also keep profile and scenario data on this device only.',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    FilledButton.icon(
                      onPressed: _dismiss,
                      icon: const Icon(Icons.phone_android_outlined),
                      label: const Text('Continue local-only'),
                    ),
                    OutlinedButton.icon(
                      onPressed: _openSyncSetup,
                      icon: const Icon(Icons.cloud_sync_outlined),
                      label: const Text('Sync setup'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class CalculatorModuleCard extends StatelessWidget {
  const CalculatorModuleCard({
    super.key,
    required this.title,
    required this.status,
    required this.description,
    required this.icon,
    required this.accentColor,
    this.isActive = false,
    this.onTap,
  });

  final String title;
  final String status;
  final String description;
  final IconData icon;
  final Color accentColor;
  final bool isActive;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Card(
      elevation: 0,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: BorderSide(
          color: isActive
              ? accentColor.withValues(alpha: 0.35)
              : colorScheme.outlineVariant,
        ),
      ),
      child: InkWell(
        onTap: isActive ? onTap : null,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: isActive
                      ? accentColor.withValues(alpha: 0.12)
                      : colorScheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  icon,
                  color: isActive ? accentColor : colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            title,
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        StatusChip(
                          label: status,
                          isActive: isActive,
                          accentColor: accentColor,
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      description,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              if (isActive) ...[
                const SizedBox(width: 8),
                const Icon(Icons.chevron_right),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class StatusChip extends StatelessWidget {
  const StatusChip({
    super.key,
    required this.label,
    required this.isActive,
    this.accentColor,
  });

  final String label;
  final bool isActive;
  final Color? accentColor;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: isActive && accentColor != null
            ? accentColor!.withValues(alpha: 0.12)
            : colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
          color: isActive && accentColor != null
              ? accentColor
              : colorScheme.onSurfaceVariant,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class VersionNote extends StatelessWidget {
  const VersionNote({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: const Color(0xFFFFF7E2),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFE8C96A)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.info_outline, color: Color(0xFF7A5B00)),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'v1 will launch in English first. Supabase cloud sync, Bahasa Malaysia, comparison exports, and richer saved scenarios can expand after the first stable release.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: const Color(0xFF4F3D08),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class AppNavigationDrawer extends StatelessWidget {
  const AppNavigationDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Drawer(
      child: SafeArea(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 18, 20, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.account_balance_wallet_outlined,
                    color: theme.colorScheme.primary,
                    size: 32,
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Spectra Calculator',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Profile, loans, saved plans, settings.',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            ListTile(
              leading: const Icon(Icons.person_outline, color: _profileAccent),
              title: const Text('Saved Profile'),
              subtitle: const Text('Salary, expenses, targets'),
              onTap: () {
                Navigator.of(context).pop();
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const PersonalProfileScreen(),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(
                Icons.account_balance_wallet_outlined,
                color: _homeLoanAccent,
              ),
              title: const Text('Overall Loans'),
              subtitle: const Text('Monthly commitments and balance'),
              onTap: () {
                Navigator.of(context).pop();
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const OverallLoansScreen(),
                  ),
                );
              },
            ),
            const Divider(height: 1),
            ListTile(
              leading: const Icon(Icons.bookmarks_outlined),
              title: const Text('Saved Scenarios'),
              onTap: () {
                Navigator.of(context).pop();
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const SavedScenariosScreen(),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.translate_outlined),
              title: const Text('Language'),
              subtitle: const Text('English, BM, Chinese, Tamil'),
              onTap: () {
                Navigator.of(context).pop();
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const LanguageScreen(),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.account_circle_outlined),
              title: const Text('Account & Sync'),
              subtitle: const Text('Local-only or Supabase cloud sync'),
              onTap: () {
                Navigator.of(context).pop();
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const AccountSyncScreen(),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.settings_outlined),
              title: const Text('Settings'),
              onTap: () {
                Navigator.of(context).pop();
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const SettingsScreen(),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class HomeLoanScreen extends StatefulWidget {
  const HomeLoanScreen({super.key, this.initialScenario});

  final HomeLoanScenario? initialScenario;

  @override
  State<HomeLoanScreen> createState() => _HomeLoanScreenState();
}

class _HomeLoanScreenState extends State<HomeLoanScreen> {
  final _propertyPriceController = TextEditingController(text: '500000');
  final _downPaymentController = TextEditingController(text: '10');
  final _interestRateController = TextEditingController(text: '4.00');
  final _tenureController = TextEditingController(text: '35');
  final _spaLegalFeeController = TextEditingController();
  final _loanLegalFeeController = TextEditingController();
  final _valuationFeeController = TextEditingController();
  final _serviceTaxController = TextEditingController();
  final _disbursementController = TextEditingController();
  final _monthlyIncomeController = TextEditingController();
  final _existingCommitmentsController = TextEditingController(text: '0');
  final _targetDsrController = TextEditingController(text: '40');
  final _calculator = HomeLoanCalculator(rules: MalaysiaHomeLoanRules.current);

  DateTime _spaDate = DateTime(2026, 6, 30);
  MalaysiaBuyerType _buyerType = MalaysiaBuyerType.citizen;
  HomePurchaseType _purchaseType = HomePurchaseType.subsale;
  HomeFinancingType _financingType = HomeFinancingType.conventional;
  bool _isFirstResidentialHome = false;
  bool _professionalFeesManuallyEdited = false;
  HomeLoanResult? _result;
  AffordabilityResult? _affordabilityResult;
  String? _error;

  @override
  void initState() {
    super.initState();
    if (widget.initialScenario case final scenario?) {
      _applyScenario(scenario, updateState: false);
    } else {
      _applyProfessionalFeeEstimates(updateState: false);
    }
    _calculate(updateState: false);
  }

  @override
  void dispose() {
    _propertyPriceController.dispose();
    _downPaymentController.dispose();
    _interestRateController.dispose();
    _tenureController.dispose();
    _spaLegalFeeController.dispose();
    _loanLegalFeeController.dispose();
    _valuationFeeController.dispose();
    _serviceTaxController.dispose();
    _disbursementController.dispose();
    _monthlyIncomeController.dispose();
    _existingCommitmentsController.dispose();
    _targetDsrController.dispose();
    super.dispose();
  }

  void _calculate({bool updateState = true}) {
    try {
      if (!_professionalFeesManuallyEdited) {
        _applyProfessionalFeeEstimates(updateState: false);
      }
      final input = HomeLoanInput(
        propertyPrice: _parseMoney(_propertyPriceController.text),
        downPaymentPercent: _parsePercent(_downPaymentController.text),
        annualInterestRatePercent: _parsePercent(_interestRateController.text),
        tenureYears: _parseWholeNumber(_tenureController.text),
        spaDate: _spaDate,
        buyerType: _buyerType,
        purchaseType: _purchaseType,
        financingType: _financingType,
        isFirstResidentialHome: _isFirstResidentialHome,
        extraUpfrontCosts: _buildProfessionalCostItems(),
      );
      final nextResult = _calculator.calculate(input);
      final nextAffordabilityResult = _calculator.calculateAffordability(
        AffordabilityInput(
          monthlyIncome: _parseOptionalMoney(_monthlyIncomeController.text),
          existingMonthlyCommitments: _parseOptionalMoney(
            _existingCommitmentsController.text,
          ),
          targetDsrPercent: _parseOptionalPercent(_targetDsrController.text),
          loanAmount: input.loanAmount,
          annualInterestRatePercent: input.annualInterestRatePercent,
          currentMonthlyInstallment: nextResult.monthlyInstallment,
        ),
      );

      if (updateState) {
        setState(() {
          _result = nextResult;
          _affordabilityResult = nextAffordabilityResult;
          _error = null;
        });
      } else {
        _result = nextResult;
        _affordabilityResult = nextAffordabilityResult;
        _error = null;
      }
    } on FormatException catch (error) {
      _setCalculationError(error.message, updateState);
    } on ArgumentError catch (error) {
      _setCalculationError(
        error.message ?? 'Check the input values.',
        updateState,
      );
    }
  }

  void _refreshProfessionalFeeEstimates() {
    try {
      _applyProfessionalFeeEstimates();
      _calculate();
    } on FormatException catch (error) {
      _setCalculationError(error.message, true);
    } on ArgumentError catch (error) {
      _setCalculationError(error.message ?? 'Check the input values.', true);
    }
  }

  void _applyProfessionalFeeEstimates({bool updateState = true}) {
    final estimate = _calculator.estimateProfessionalFees(
      propertyPrice: _parseMoney(_propertyPriceController.text),
      loanAmount: _currentLoanAmount(),
      purchaseType: _purchaseType,
    );

    void applyEstimate() {
      _spaLegalFeeController.text = formatEditableAmount(estimate.spaLegalFee);
      _loanLegalFeeController.text = formatEditableAmount(
        estimate.loanLegalFee,
      );
      _valuationFeeController.text = formatEditableAmount(
        estimate.valuationFee,
      );
      _serviceTaxController.text = formatEditableAmount(estimate.serviceTax);
      _disbursementController.text = '1500.00';
      _professionalFeesManuallyEdited = false;
    }

    if (updateState) {
      setState(applyEstimate);
    } else {
      applyEstimate();
    }
  }

  List<UpfrontCostItem> _buildProfessionalCostItems() {
    final fields = [
      (
        label: 'SPA legal fee',
        amount: _parseMoney(_spaLegalFeeController.text),
      ),
      (
        label: 'Loan legal fee',
        amount: _parseMoney(_loanLegalFeeController.text),
      ),
      (
        label: 'Valuation fee',
        amount: _parseMoney(_valuationFeeController.text),
      ),
      (
        label: 'SST / service tax',
        amount: _parseMoney(_serviceTaxController.text),
      ),
      (
        label: 'Disbursement buffer',
        amount: _parseMoney(_disbursementController.text),
      ),
    ];

    return [
      for (final field in fields)
        if (field.amount > 0)
          UpfrontCostItem(
            label: field.label,
            amount: field.amount,
            category: UpfrontCostCategory.professional,
          ),
    ];
  }

  double _currentLoanAmount() {
    final propertyPrice = _parseMoney(_propertyPriceController.text);
    final downPaymentPercent = _parsePercent(_downPaymentController.text);
    return propertyPrice - (propertyPrice * downPaymentPercent / 100);
  }

  void _markProfessionalFeesEdited(String _) {
    _professionalFeesManuallyEdited = true;
  }

  Future<void> _openSavedScenarios() async {
    final scenario = await Navigator.of(context).push<HomeLoanScenario>(
      MaterialPageRoute<HomeLoanScenario>(
        builder: (_) => const SavedScenariosScreen(
          selectionMode: true,
          filterType: SavedScenarioType.homeLoan,
        ),
      ),
    );

    if (scenario == null) {
      return;
    }

    _applyScenario(scenario);
    _calculate();
  }

  Future<void> _saveCurrentScenario() async {
    _calculate();

    if (_error != null || _result == null) {
      return;
    }

    final name = await showDialog<String>(
      context: context,
      builder: (context) =>
          SaveScenarioDialog(initialName: _defaultScenarioName()),
    );

    if (name == null || name.trim().isEmpty || !mounted) {
      return;
    }

    final now = DateTime.now();
    final scenario = _buildScenario(
      id: createScenarioId(now),
      name: name.trim(),
      createdAt: now,
    );
    await SavedScenarioRepository().save(scenario);

    if (!mounted) {
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Saved "${scenario.name}" on this device.')),
    );
  }

  HomeLoanScenario _buildScenario({
    required String id,
    required String name,
    required DateTime createdAt,
  }) {
    final result = _result;
    if (result == null) {
      throw StateError('Calculate before saving.');
    }

    return HomeLoanScenario(
      id: id,
      name: name,
      createdAt: createdAt,
      propertyPrice: _parseMoney(_propertyPriceController.text),
      downPaymentPercent: _parsePercent(_downPaymentController.text),
      annualInterestRatePercent: _parsePercent(_interestRateController.text),
      tenureYears: _parseWholeNumber(_tenureController.text),
      spaDate: _spaDate,
      buyerType: _buyerType,
      purchaseType: _purchaseType,
      financingType: _financingType,
      isFirstResidentialHome: _isFirstResidentialHome,
      spaLegalFee: _parseMoney(_spaLegalFeeController.text),
      loanLegalFee: _parseMoney(_loanLegalFeeController.text),
      valuationFee: _parseMoney(_valuationFeeController.text),
      serviceTax: _parseMoney(_serviceTaxController.text),
      disbursementBuffer: _parseMoney(_disbursementController.text),
      monthlyInstallment: result.monthlyInstallment,
      upfrontCash: result.upfrontCosts.total,
      totalInterest: result.totalInterest,
    );
  }

  void _applyScenario(HomeLoanScenario scenario, {bool updateState = true}) {
    void apply() {
      _propertyPriceController.text = formatEditableAmount(
        scenario.propertyPrice,
      );
      _downPaymentController.text = formatEditablePercent(
        scenario.downPaymentPercent,
      );
      _interestRateController.text = formatEditablePercent(
        scenario.annualInterestRatePercent,
      );
      _tenureController.text = scenario.tenureYears.toString();
      _spaLegalFeeController.text = formatEditableAmount(scenario.spaLegalFee);
      _loanLegalFeeController.text = formatEditableAmount(
        scenario.loanLegalFee,
      );
      _valuationFeeController.text = formatEditableAmount(
        scenario.valuationFee,
      );
      _serviceTaxController.text = formatEditableAmount(scenario.serviceTax);
      _disbursementController.text = formatEditableAmount(
        scenario.disbursementBuffer,
      );
      _spaDate = scenario.spaDate;
      _buyerType = scenario.buyerType;
      _purchaseType = scenario.purchaseType;
      _financingType = scenario.financingType;
      _isFirstResidentialHome = scenario.isFirstResidentialHome;
      _monthlyIncomeController.clear();
      _existingCommitmentsController.text = '0';
      _targetDsrController.text = '40';
      _professionalFeesManuallyEdited = true;
    }

    if (updateState) {
      setState(apply);
    } else {
      apply();
    }
  }

  String _defaultScenarioName() {
    return 'Home ${formatMyr(_parseMoney(_propertyPriceController.text))}';
  }

  void _setCalculationError(String message, bool updateState) {
    if (updateState) {
      setState(() {
        _error = message;
      });
    } else {
      _error = message;
    }
  }

  Future<void> _pickSpaDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _spaDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2035),
    );

    if (picked == null) {
      return;
    }

    setState(() {
      _spaDate = picked;
    });
    _calculate();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Home Loan'),
        actions: [
          IconButton(
            tooltip: 'Assumptions and sources',
            icon: const Icon(Icons.fact_check_outlined),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => const AssumptionsSourcesScreen(),
                ),
              );
            },
          ),
          IconButton(
            tooltip: 'Saved scenarios',
            icon: const Icon(Icons.bookmarks_outlined),
            onPressed: _openSavedScenarios,
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
          children: [
            Text(
              'Property financing',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Malaysia estimates in MYR. Rules reviewed ${formatDate(_calculator.rules.lastReviewed)}.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 18),
            FinanceTextField(
              controller: _propertyPriceController,
              label: 'Property price',
              prefixText: 'RM ',
              icon: Icons.sell_outlined,
              infoTitle: 'Property price',
              infoMessage:
                  'Use the agreed purchase price before down payment. For subsale, this is usually the SPA price.',
            ),
            FinanceTextField(
              controller: _downPaymentController,
              label: 'Down payment',
              suffixText: '%',
              icon: Icons.payments_outlined,
              infoTitle: 'Down payment',
              infoMessage:
                  'The part paid upfront by you. A 10% down payment means the calculator estimates 90% financing.',
            ),
            FinanceTextField(
              controller: _interestRateController,
              label: _financingType == HomeFinancingType.islamic
                  ? 'Profit rate'
                  : 'Interest rate',
              suffixText: '% p.a.',
              icon: Icons.percent_outlined,
              infoTitle: 'Interest / profit rate',
              infoMessage:
                  'Enter the annual rate from the bank quote. Islamic financing commonly uses profit rate wording, while conventional financing uses interest rate wording.',
            ),
            FinanceTextField(
              controller: _tenureController,
              label: 'Tenure',
              suffixText: 'years',
              icon: Icons.schedule_outlined,
              isWholeNumber: true,
              infoTitle: 'Tenure',
              infoMessage:
                  'Loan tenure is the repayment period. A longer tenure usually lowers the monthly installment but increases total interest or profit paid.',
            ),
            const SizedBox(height: 4),
            BuyerTypeSelector(
              selected: _buyerType,
              onChanged: (value) {
                setState(() {
                  _buyerType = value;
                });
                _calculate();
              },
            ),
            const SizedBox(height: 10),
            PurchaseTypeSelector(
              selected: _purchaseType,
              onChanged: (value) {
                setState(() {
                  _purchaseType = value;
                });
                _refreshProfessionalFeeEstimates();
              },
            ),
            const SizedBox(height: 10),
            FinancingTypeSelector(
              selected: _financingType,
              onChanged: (value) {
                setState(() {
                  _financingType = value;
                });
                _calculate();
              },
            ),
            const SizedBox(height: 10),
            ListTile(
              contentPadding: const EdgeInsets.symmetric(horizontal: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: BorderSide(color: colorScheme.outlineVariant),
              ),
              tileColor: colorScheme.surface,
              leading: const Icon(Icons.calendar_month_outlined),
              title: const Text(
                'SPA date',
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
              subtitle: Text(formatDate(_spaDate)),
              trailing: TextButton(
                onPressed: _pickSpaDate,
                child: const Text('Change'),
              ),
            ),
            const SizedBox(height: 10),
            SwitchListTile(
              contentPadding: const EdgeInsets.symmetric(horizontal: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: BorderSide(color: colorScheme.outlineVariant),
              ),
              tileColor: colorScheme.surface,
              secondary: const Icon(Icons.verified_user_outlined),
              title: const Text(
                'First residential home',
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
              subtitle: const Text('Applies eligible stamp duty exemption.'),
              value: _isFirstResidentialHome,
              onChanged: (value) {
                setState(() {
                  _isFirstResidentialHome = value;
                });
                _calculate();
              },
            ),
            const SizedBox(height: 14),
            SectionPanel(
              title: 'Optional affordability check',
              icon: Icons.account_balance_wallet_outlined,
              infoTitle: 'Affordability check',
              infoMessage:
                  'This estimates whether the monthly installment fits your income using DSR. Banks may use their own approval rules, accepted income, and buffers.',
              children: [
                Text(
                  'Income is used only for this estimate and is not saved into scenarios in this version.',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 12),
                FinanceTextField(
                  controller: _monthlyIncomeController,
                  label: 'Monthly gross income',
                  prefixText: 'RM ',
                  icon: Icons.payments_outlined,
                  infoTitle: 'Monthly gross income',
                  infoMessage:
                      'Your salary before EPF, SOCSO, EIS, PCB, and other deductions. You can usually find this on your payslip.',
                ),
                FinanceTextField(
                  controller: _existingCommitmentsController,
                  label: 'Existing monthly commitments',
                  prefixText: 'RM ',
                  icon: Icons.credit_score_outlined,
                  infoTitle: 'Existing commitments',
                  infoMessage:
                      'Monthly debts you already pay, such as car loan, personal loan, credit card instalments, PTPTN, or other fixed repayments.',
                ),
                FinanceTextField(
                  controller: _targetDsrController,
                  label: 'Target DSR',
                  suffixText: '%',
                  icon: Icons.speed_outlined,
                  infoTitle: 'Debt service ratio',
                  infoMessage:
                      'DSR compares monthly debt payments against gross income. The default is only a planning target, not a fixed bank approval rule.',
                ),
              ],
            ),
            const SizedBox(height: 14),
            SectionPanel(
              title: 'Editable professional fees',
              icon: Icons.edit_note_outlined,
              infoTitle: 'Professional fees',
              infoMessage:
                  'The app starts with estimates for legal, valuation, tax, and disbursement items. Replace these with actual lawyer, bank, or valuer quotes once you have them.',
              children: [
                Text(
                  'Estimated from current scales. Replace with actual quotes when available.',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 12),
                FinanceTextField(
                  controller: _spaLegalFeeController,
                  label: 'SPA legal fee',
                  prefixText: 'RM ',
                  icon: Icons.description_outlined,
                  onChanged: _markProfessionalFeesEdited,
                  infoTitle: 'SPA legal fee',
                  infoMessage:
                      'Estimated lawyer fee for the sale and purchase agreement. Actual quotes may include extra items or discounts.',
                ),
                FinanceTextField(
                  controller: _loanLegalFeeController,
                  label: 'Loan legal fee',
                  prefixText: 'RM ',
                  icon: Icons.account_balance_outlined,
                  onChanged: _markProfessionalFeesEdited,
                  infoTitle: 'Loan legal fee',
                  infoMessage:
                      'Estimated legal fee for loan or financing documentation. Islamic financing documents may be structured differently.',
                ),
                FinanceTextField(
                  controller: _valuationFeeController,
                  label: 'Valuation fee',
                  prefixText: 'RM ',
                  icon: Icons.real_estate_agent_outlined,
                  onChanged: _markProfessionalFeesEdited,
                  infoTitle: 'Valuation fee',
                  infoMessage:
                      'Estimated cost for property valuation when required by the bank. New project purchases may differ.',
                ),
                FinanceTextField(
                  controller: _serviceTaxController,
                  label: 'SST / service tax',
                  prefixText: 'RM ',
                  icon: Icons.request_quote_outlined,
                  onChanged: _markProfessionalFeesEdited,
                  infoTitle: 'SST / service tax',
                  infoMessage:
                      'Estimated service tax on applicable professional services. Confirm the actual tax treatment on the invoice.',
                ),
                FinanceTextField(
                  controller: _disbursementController,
                  label: 'Disbursement buffer',
                  prefixText: 'RM ',
                  icon: Icons.receipt_outlined,
                  onChanged: _markProfessionalFeesEdited,
                  infoTitle: 'Disbursement buffer',
                  infoMessage:
                      'A flexible buffer for searches, registration, land office, courier, printing, and other transaction expenses.',
                ),
                Align(
                  alignment: Alignment.centerRight,
                  child: OutlinedButton.icon(
                    onPressed: _refreshProfessionalFeeEstimates,
                    icon: const Icon(Icons.refresh_outlined),
                    label: const Text('Refresh estimates'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            FilledButton.icon(
              onPressed: _calculate,
              icon: const Icon(Icons.calculate_outlined),
              label: const Text('Calculate'),
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              ErrorMessage(message: _error!),
            ],
            if (_result != null) ...[
              const SizedBox(height: 18),
              ResultSummary(result: _result!),
              if (_affordabilityResult != null) ...[
                const SizedBox(height: 12),
                AffordabilityGuidancePanel(result: _affordabilityResult!),
              ],
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: _saveCurrentScenario,
                icon: const Icon(Icons.bookmark_add_outlined),
                label: const Text('Save scenario on this device'),
              ),
              const SizedBox(height: 12),
              CostBreakdown(result: _result!),
              const SizedBox(height: 12),
              AmortizationPreview(result: _result!),
            ],
          ],
        ),
      ),
    );
  }
}

class PersonalProfileScreen extends StatefulWidget {
  const PersonalProfileScreen({super.key});

  @override
  State<PersonalProfileScreen> createState() => _PersonalProfileScreenState();
}

class _PersonalProfileScreenState extends State<PersonalProfileScreen> {
  final _grossSalaryController = TextEditingController(text: '5000');
  final _epfRateController = TextEditingController(text: '11');
  final _socsoRateController = TextEditingController(text: '0.5');
  final _eisRateController = TextEditingController(text: '0.2');
  final _socialSecurityCeilingController = TextEditingController(text: '6000');
  final _pcbController = TextEditingController(text: '0');
  final _existingCommitmentsController = TextEditingController(text: '0');
  final _livingExpensesController = TextEditingController(text: '2000');
  final _targetSavingsController = TextEditingController(text: '10');
  final _targetDsrController = TextEditingController(text: '40');
  final _loanInstallmentController = TextEditingController(text: '1500');
  final _assetPriceController = TextEditingController();
  final _expectedIncomeController = TextEditingController();
  final _investmentExpensesController = TextEditingController();
  final _calculator = const SalaryPlannerCalculator();
  final _profileRepository = PersonalFinanceProfileRepository();

  SalaryPlannerResult? _result;
  String? _error;
  bool _isProfileLoaded = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
    _calculate(updateState: false);
  }

  @override
  void dispose() {
    _grossSalaryController.dispose();
    _epfRateController.dispose();
    _socsoRateController.dispose();
    _eisRateController.dispose();
    _socialSecurityCeilingController.dispose();
    _pcbController.dispose();
    _existingCommitmentsController.dispose();
    _livingExpensesController.dispose();
    _targetSavingsController.dispose();
    _targetDsrController.dispose();
    _loanInstallmentController.dispose();
    _assetPriceController.dispose();
    _expectedIncomeController.dispose();
    _investmentExpensesController.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    final profile = await _profileRepository.load();
    if (profile == null || !mounted) {
      return;
    }

    setState(() {
      _applyProfile(profile);
      _isProfileLoaded = true;
    });
    _calculate();
  }

  void _calculate({bool updateState = true}) {
    try {
      final result = _calculator.calculate(
        SalaryPlannerInput(
          grossMonthlySalary: _parseMoney(_grossSalaryController.text),
          epfEmployeeRatePercent: _parsePercent(_epfRateController.text),
          socsoEmployeeRatePercent: _parsePercent(_socsoRateController.text),
          eisEmployeeRatePercent: _parsePercent(_eisRateController.text),
          socialSecurityWageCeiling: _parseOptionalMoney(
            _socialSecurityCeilingController.text,
          ),
          monthlyPcbTax: _parseOptionalMoney(_pcbController.text),
          existingMonthlyCommitments: _parseOptionalMoney(
            _existingCommitmentsController.text,
          ),
          monthlyLivingExpenses: _parseOptionalMoney(
            _livingExpensesController.text,
          ),
          targetSavingsPercent: _parseOptionalPercent(
            _targetSavingsController.text,
          ),
          targetDsrPercent: _parseOptionalPercent(_targetDsrController.text),
          loanInstallmentToEvaluate: _parseOptionalMoney(
            _loanInstallmentController.text,
          ),
          assetPrice: _parseOptionalMoney(_assetPriceController.text),
          expectedMonthlyIncome: _parseOptionalMoney(
            _expectedIncomeController.text,
          ),
          monthlyInvestmentExpenses: _parseOptionalMoney(
            _investmentExpensesController.text,
          ),
        ),
      );

      void apply() {
        _result = result;
        _error = null;
      }

      if (updateState) {
        setState(apply);
      } else {
        apply();
      }
    } on FormatException catch (error) {
      _setError(error.message, updateState);
    } on ArgumentError catch (error) {
      _setError(error.message ?? 'Check the input values.', updateState);
    }
  }

  void _setError(String message, bool updateState) {
    if (updateState) {
      setState(() {
        _error = message;
      });
    } else {
      _error = message;
    }
  }

  PersonalFinanceProfile _buildProfile() {
    return PersonalFinanceProfile(
      grossMonthlySalary: _parseMoney(_grossSalaryController.text),
      epfEmployeeRatePercent: _parsePercent(_epfRateController.text),
      socsoEmployeeRatePercent: _parsePercent(_socsoRateController.text),
      eisEmployeeRatePercent: _parsePercent(_eisRateController.text),
      socialSecurityWageCeiling: _parseOptionalMoney(
        _socialSecurityCeilingController.text,
      ),
      monthlyPcbTax: _parseOptionalMoney(_pcbController.text),
      existingMonthlyCommitments: _parseOptionalMoney(
        _existingCommitmentsController.text,
      ),
      monthlyLivingExpenses: _parseOptionalMoney(
        _livingExpensesController.text,
      ),
      targetSavingsPercent: _parseOptionalPercent(
        _targetSavingsController.text,
      ),
      targetDsrPercent: _parseOptionalPercent(_targetDsrController.text),
    );
  }

  void _applyProfile(PersonalFinanceProfile profile) {
    _grossSalaryController.text = formatEditableAmount(
      profile.grossMonthlySalary,
    );
    _epfRateController.text = formatEditablePercent(
      profile.epfEmployeeRatePercent,
    );
    _socsoRateController.text = formatEditablePercent(
      profile.socsoEmployeeRatePercent,
    );
    _eisRateController.text = formatEditablePercent(
      profile.eisEmployeeRatePercent,
    );
    _socialSecurityCeilingController.text = formatEditableAmount(
      profile.socialSecurityWageCeiling,
    );
    _pcbController.text = formatEditableAmount(profile.monthlyPcbTax);
    _existingCommitmentsController.text = formatEditableAmount(
      profile.existingMonthlyCommitments,
    );
    _livingExpensesController.text = formatEditableAmount(
      profile.monthlyLivingExpenses,
    );
    _targetSavingsController.text = formatEditablePercent(
      profile.targetSavingsPercent,
    );
    _targetDsrController.text = formatEditablePercent(profile.targetDsrPercent);
  }

  Future<void> _saveProfile() async {
    _calculate();

    if (_error != null) {
      return;
    }

    await _profileRepository.save(_buildProfile());
    if (!mounted) {
      return;
    }

    setState(() {
      _isProfileLoaded = true;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Salary profile saved on this device.')),
    );
  }

  Future<void> _deleteProfile() async {
    await _profileRepository.delete();
    if (!mounted) {
      return;
    }

    setState(() {
      _isProfileLoaded = false;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Local salary profile deleted.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final result = _result;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Personal Profile'),
        actions: [
          IconButton(
            tooltip: 'Assumptions and sources',
            icon: const Icon(Icons.fact_check_outlined),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => const AssumptionsSourcesScreen(),
                ),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
          children: [
            Text(
              'Income and targets',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Save your salary, expenses, and targets locally so loan decisions start from your real monthly cashflow.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 18),
            SectionPanel(
              title: 'Income and deductions',
              icon: Icons.payments_outlined,
              infoTitle: 'Income and deductions',
              infoMessage:
                  'These values estimate take-home pay. Use your payslip or payroll portal for the most reliable EPF, SOCSO, EIS, and PCB numbers.',
              children: [
                FinanceTextField(
                  controller: _grossSalaryController,
                  label: 'Gross monthly salary',
                  prefixText: 'RM ',
                  icon: Icons.account_balance_wallet_outlined,
                  infoTitle: 'Gross monthly salary',
                  infoMessage:
                      'Your salary before deductions. This is usually the gross pay amount shown on your payslip.',
                ),
                FinanceTextField(
                  controller: _epfRateController,
                  label: 'EPF employee rate',
                  suffixText: '%',
                  icon: Icons.savings_outlined,
                  infoTitle: 'EPF employee rate',
                  infoMessage:
                      'Your KWSP/EPF employee contribution percentage. Many employees use 11%, but always check your payslip or KWSP settings.',
                ),
                FinanceTextField(
                  controller: _socsoRateController,
                  label: 'SOCSO employee estimate',
                  suffixText: '%',
                  icon: Icons.health_and_safety_outlined,
                  infoTitle: 'SOCSO employee estimate',
                  infoMessage:
                      'SOCSO/PERKESO is normally calculated from official contribution tables. This app uses an editable estimate for planning.',
                ),
                FinanceTextField(
                  controller: _eisRateController,
                  label: 'EIS employee estimate',
                  suffixText: '%',
                  icon: Icons.work_history_outlined,
                  infoTitle: 'EIS employee estimate',
                  infoMessage:
                      'EIS/SIP is usually a small payroll deduction under PERKESO. Use your payslip for the actual amount.',
                ),
                FinanceTextField(
                  controller: _socialSecurityCeilingController,
                  label: 'SOCSO/EIS wage ceiling',
                  prefixText: 'RM ',
                  icon: Icons.rule_outlined,
                  infoTitle: 'SOCSO/EIS wage ceiling',
                  infoMessage:
                      'The salary cap used by this estimate before applying SOCSO and EIS percentages. Edit it if official payroll rules change.',
                ),
                FinanceTextField(
                  controller: _pcbController,
                  label: 'PCB / tax deduction',
                  prefixText: 'RM ',
                  icon: Icons.receipt_long_outlined,
                  infoTitle: 'PCB / tax deduction',
                  infoMessage:
                      'PCB is monthly income tax deduction by employer. You can find it on your payslip or payroll/HR portal.',
                ),
              ],
            ),
            const SizedBox(height: 12),
            SectionPanel(
              title: 'Cashflow plan',
              icon: Icons.speed_outlined,
              infoTitle: 'Cashflow plan',
              infoMessage:
                  'Use this to estimate how much room remains after debts, living costs, and your savings target.',
              children: [
                FinanceTextField(
                  controller: _existingCommitmentsController,
                  label: 'Existing monthly commitments',
                  prefixText: 'RM ',
                  icon: Icons.credit_score_outlined,
                  infoTitle: 'Existing commitments',
                  infoMessage:
                      'Put fixed debt commitments here only if they are not already added under Overall Loans, to avoid double-counting.',
                ),
                FinanceTextField(
                  controller: _livingExpensesController,
                  label: 'Monthly living expenses',
                  prefixText: 'RM ',
                  icon: Icons.shopping_cart_outlined,
                  infoTitle: 'Monthly living expenses',
                  infoMessage:
                      'A practical estimate for food, transport, rent, insurance, family support, utilities, subscriptions, and daily spending.',
                ),
                FinanceTextField(
                  controller: _targetSavingsController,
                  label: 'Target savings',
                  suffixText: '% of take-home',
                  icon: Icons.savings_outlined,
                  infoTitle: 'Target savings',
                  infoMessage:
                      'The share of take-home pay you want to keep aside before deciding if a new loan feels comfortable.',
                ),
                FinanceTextField(
                  controller: _targetDsrController,
                  label: 'Target DSR',
                  suffixText: '%',
                  icon: Icons.percent_outlined,
                  infoTitle: 'Target DSR',
                  infoMessage:
                      'A personal planning limit for monthly debt payments compared with gross income. It is not a bank guarantee.',
                ),
                FinanceTextField(
                  controller: _loanInstallmentController,
                  label: 'Loan installment to evaluate',
                  prefixText: 'RM ',
                  icon: Icons.request_quote_outlined,
                  infoTitle: 'Loan installment to evaluate',
                  infoMessage:
                      'Enter a possible new monthly installment to test whether it fits your salary, expenses, and DSR target.',
                ),
              ],
            ),
            const SizedBox(height: 12),
            SectionPanel(
              title: 'Optional investment view',
              icon: Icons.trending_up_outlined,
              infoTitle: 'Investment view',
              infoMessage:
                  'This checks simple monthly cashflow for income-producing assets. It does not judge capital gain, vacancy risk, tax, or suitability.',
              children: [
                Text(
                  'Use this for rental or income-producing assets. It is a cashflow estimate, not investment advice.',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 12),
                FinanceTextField(
                  controller: _assetPriceController,
                  label: 'Asset / property price',
                  prefixText: 'RM ',
                  icon: Icons.home_work_outlined,
                  infoTitle: 'Asset / property price',
                  infoMessage:
                      'Purchase price or asset value used to compare the expected monthly income against the asset size.',
                ),
                FinanceTextField(
                  controller: _expectedIncomeController,
                  label: 'Expected monthly rent / income',
                  prefixText: 'RM ',
                  icon: Icons.attach_money_outlined,
                  infoTitle: 'Expected monthly income',
                  infoMessage:
                      'Estimated rent or income from the asset before expenses. Use a conservative figure when unsure.',
                ),
                FinanceTextField(
                  controller: _investmentExpensesController,
                  label: 'Monthly upkeep / investment costs',
                  prefixText: 'RM ',
                  icon: Icons.build_outlined,
                  infoTitle: 'Monthly upkeep',
                  infoMessage:
                      'Maintenance, management fee, sinking fund, repairs, insurance, vacancy buffer, or other recurring costs.',
                ),
              ],
            ),
            const SizedBox(height: 14),
            FilledButton.icon(
              onPressed: _calculate,
              icon: const Icon(Icons.calculate_outlined),
              label: const Text('Calculate'),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                OutlinedButton.icon(
                  onPressed: _saveProfile,
                  icon: const Icon(Icons.person_add_alt_outlined),
                  label: Text(
                    _isProfileLoaded ? 'Update local profile' : 'Save profile',
                  ),
                ),
                OutlinedButton.icon(
                  onPressed: _isProfileLoaded ? _deleteProfile : null,
                  icon: const Icon(Icons.person_remove_outlined),
                  label: const Text('Delete profile'),
                ),
              ],
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              ErrorMessage(message: _error!),
            ],
            if (result != null) ...[
              const SizedBox(height: 18),
              SalaryPlannerSummary(result: result),
              const SizedBox(height: 12),
              SalaryPlannerBreakdown(result: result),
              const SizedBox(height: 12),
              InvestmentCashflowPanel(result: result),
            ],
          ],
        ),
      ),
    );
  }
}

class OverallLoansScreen extends StatefulWidget {
  const OverallLoansScreen({super.key});

  @override
  State<OverallLoansScreen> createState() => _OverallLoansScreenState();
}

class _OverallLoansScreenState extends State<OverallLoansScreen> {
  final _profileRepository = PersonalFinanceProfileRepository();
  final _loanRepository = OngoingLoanRepository();
  final _calculator = const SalaryPlannerCalculator();
  final _projectionCalculator = const OngoingLoanProjectionCalculator();
  late Future<
    ({PersonalFinanceProfile? profile, List<OngoingLoanCommitment> loans})
  >
  _overviewFuture;

  @override
  void initState() {
    super.initState();
    _overviewFuture = _loadOverview();
  }

  Future<({PersonalFinanceProfile? profile, List<OngoingLoanCommitment> loans})>
  _loadOverview() async {
    final profile = await _profileRepository.load();
    final loans = await _loanRepository.loadAll();
    return (profile: profile, loans: loans);
  }

  void _reload() {
    setState(() {
      _overviewFuture = _loadOverview();
    });
  }

  Future<void> _openProfile() async {
    await Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => const PersonalProfileScreen()),
    );
    _reload();
  }

  Future<void> _addLoan() async {
    final loan = await showDialog<OngoingLoanCommitment>(
      context: context,
      builder: (context) => const OngoingLoanDialog(),
    );

    if (loan == null) {
      return;
    }

    await _loanRepository.save(loan);
    if (!mounted) {
      return;
    }
    _reload();
  }

  Future<void> _editLoan(OngoingLoanCommitment existingLoan) async {
    final loan = await showDialog<OngoingLoanCommitment>(
      context: context,
      builder: (context) => OngoingLoanDialog(initialLoan: existingLoan),
    );

    if (loan == null) {
      return;
    }

    await _loanRepository.save(loan);
    if (!mounted) {
      return;
    }
    _reload();
  }

  Future<void> _deleteLoan(OngoingLoanCommitment loan) async {
    await _loanRepository.delete(loan.id);
    if (!mounted) {
      return;
    }
    _reload();
  }

  SalaryPlannerResult? _buildResult(
    PersonalFinanceProfile? profile,
    List<OngoingLoanCommitment> loans,
  ) {
    if (profile == null) {
      return null;
    }

    return _calculator.calculate(
      SalaryPlannerInput(
        grossMonthlySalary: profile.grossMonthlySalary,
        epfEmployeeRatePercent: profile.epfEmployeeRatePercent,
        socsoEmployeeRatePercent: profile.socsoEmployeeRatePercent,
        eisEmployeeRatePercent: profile.eisEmployeeRatePercent,
        socialSecurityWageCeiling: profile.socialSecurityWageCeiling,
        monthlyPcbTax: profile.monthlyPcbTax,
        existingMonthlyCommitments: profile.existingMonthlyCommitments,
        monthlyLivingExpenses: profile.monthlyLivingExpenses,
        targetSavingsPercent: profile.targetSavingsPercent,
        targetDsrPercent: profile.targetDsrPercent,
        loanInstallmentToEvaluate: _totalMonthlyLoans(loans),
      ),
    );
  }

  double _totalMonthlyLoans(List<OngoingLoanCommitment> loans) {
    return loans.fold(0, (sum, loan) => sum + loan.monthlyPayment);
  }

  double _totalRemainingBalance(List<OngoingLoanCommitment> loans) {
    return loans.fold(0, (sum, loan) => sum + loan.remainingBalance);
  }

  double _totalFutureRepayment(Iterable<OngoingLoanProjection> projections) {
    return projections.fold(
      0,
      (sum, projection) => sum + projection.totalFuturePayment,
    );
  }

  double _totalFutureInterest(Iterable<OngoingLoanProjection> projections) {
    return projections.fold(
      0,
      (sum, projection) => sum + projection.totalFutureInterest,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Overall Loans')),
      body: SafeArea(
        child: FutureBuilder<({PersonalFinanceProfile? profile, List<OngoingLoanCommitment> loans})>(
          future: _overviewFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState != ConnectionState.done) {
              return const Center(child: CircularProgressIndicator());
            }

            final profile = snapshot.data?.profile;
            final loans = snapshot.data?.loans ?? const [];
            final result = _buildResult(profile, loans);
            final totalLoans = _totalMonthlyLoans(loans);
            final totalRemainingBalance = _totalRemainingBalance(loans);
            final projections = {
              for (final loan in loans)
                loan.id: _projectionCalculator.calculate(loan),
            };
            final totalFutureRepayment = _totalFutureRepayment(
              projections.values,
            );
            final totalFutureInterest = _totalFutureInterest(
              projections.values,
            );

            return ListView(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
              children: [
                Text(
                  'Monthly cashflow',
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Track ongoing loans against your saved profile to see what is left each month.',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 18),
                if (profile == null)
                  SectionPanel(
                    title: 'Profile needed',
                    icon: Icons.person_outline,
                    children: [
                      Text(
                        'Save your Personal Profile first so this screen can estimate take-home pay and remaining money.',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Align(
                        alignment: Alignment.centerLeft,
                        child: FilledButton.icon(
                          onPressed: _openProfile,
                          icon: const Icon(Icons.person_add_alt_outlined),
                          label: const Text('Open Personal Profile'),
                        ),
                      ),
                    ],
                  )
                else ...[
                  ConsumerLoanSummary(
                    title: 'Estimated money left',
                    primaryValue: formatMyr(result!.remainingAfterNewLoan),
                    subtitle:
                        'After take-home pay, other commitments, living expenses, and listed ongoing loans.',
                    metrics: [
                      ResultMetric(
                        label: 'Take-home',
                        value: formatMyr(result.netMonthlyIncome),
                      ),
                      ResultMetric(
                        label: 'Loan payments',
                        value: formatMyr(totalLoans),
                      ),
                      if (totalRemainingBalance > 0)
                        ResultMetric(
                          label: 'Outstanding',
                          value: formatMyr(totalRemainingBalance),
                        ),
                      ResultMetric(
                        label: 'DSR with loans',
                        value: formatPercent(result.dsrAfterNewLoanPercent),
                      ),
                      ResultMetric(
                        label: 'After savings',
                        value: formatMyr(result.remainingAfterSavingsTarget),
                      ),
                    ],
                    notes: [
                      _cashflowFitMessage(result.cashflowFitStatus),
                      'Use the list below for ongoing loans only. Saved calculator scenarios are still kept separately as plans.',
                    ],
                  ),
                  const SizedBox(height: 12),
                  SectionPanel(
                    title: 'Cashflow breakdown',
                    icon: Icons.account_balance_wallet_outlined,
                    infoTitle: 'Cashflow breakdown',
                    infoMessage:
                        'This combines your saved profile with listed ongoing loans to estimate what remains after required payments and savings target.',
                    children: [
                      AmountRow(
                        label: 'Net monthly income',
                        amount: result.netMonthlyIncome,
                        isStrong: true,
                      ),
                      AmountRow(
                        label: 'Other commitments from profile',
                        amount: profile.existingMonthlyCommitments,
                      ),
                      AmountRow(
                        label: 'Listed ongoing loans',
                        amount: totalLoans,
                      ),
                      AmountRow(
                        label: 'Living expenses',
                        amount: profile.monthlyLivingExpenses,
                      ),
                      AmountRow(
                        label: 'Target savings',
                        amount: result.targetMonthlySavings,
                      ),
                      const Divider(height: 20),
                      AmountRow(
                        label: 'Remaining after savings target',
                        amount: result.remainingAfterSavingsTarget,
                        isStrong: true,
                      ),
                      if (totalRemainingBalance > 0)
                        AmountRow(
                          label: 'Known outstanding balances',
                          amount: totalRemainingBalance,
                        ),
                      if (totalFutureRepayment > 0)
                        AmountRow(
                          label: 'Projected future repayments',
                          amount: totalFutureRepayment,
                        ),
                      if (totalFutureInterest > 0)
                        AmountRow(
                          label: 'Projected interest / profit',
                          amount: totalFutureInterest,
                        ),
                    ],
                  ),
                ],
                const SizedBox(height: 12),
                SectionPanel(
                  title: 'Actual loan tracker',
                  icon: Icons.receipt_long_outlined,
                  infoTitle: 'Actual loan tracker',
                  infoMessage:
                      'Add loans you are already paying every month, then update the outstanding balance when statements change. Saved calculator scenarios are plans until you add them here.',
                  children: [
                    if (loans.isEmpty)
                      Text(
                        'No actual loans added yet. Add your current monthly repayments and outstanding balances to track payoff time.',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      )
                    else
                      for (final loan in loans)
                        OngoingLoanTile(
                          loan: loan,
                          projection: projections[loan.id]!,
                          onEdit: () => _editLoan(loan),
                          onDelete: () => _deleteLoan(loan),
                        ),
                    const SizedBox(height: 10),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: FilledButton.icon(
                        onPressed: _addLoan,
                        icon: const Icon(Icons.add_outlined),
                        label: const Text('Add actual loan'),
                      ),
                    ),
                  ],
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class OngoingLoanTile extends StatelessWidget {
  const OngoingLoanTile({
    super.key,
    required this.loan,
    required this.projection,
    required this.onEdit,
    required this.onDelete,
  });

  final OngoingLoanCommitment loan;
  final OngoingLoanProjection projection;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final accent = ongoingLoanAccent(loan.type);
    final payoffText = loan.remainingBalance <= 0
        ? 'No balance'
        : projection.isPaidOff
        ? formatMonthsDuration(projection.monthsProjected)
        : 'Review';

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: accent.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  ongoingLoanIcon(loan.type),
                  color: accent,
                  size: 20,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      loan.name,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${loan.type.label} - ${formatMyr(loan.monthlyPayment)} monthly',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                    if (loan.annualRatePercent > 0)
                      Text(
                        '${formatEditablePercent(loan.annualRatePercent)}% p.a. estimate',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                  ],
                ),
              ),
              IconButton(
                tooltip: 'Edit loan',
                onPressed: onEdit,
                icon: const Icon(Icons.edit_outlined),
              ),
              IconButton(
                tooltip: 'Delete loan',
                onPressed: onDelete,
                icon: const Icon(Icons.delete_outline),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              ResultMetric(
                label: 'Outstanding',
                value: formatMyr(loan.remainingBalance),
              ),
              ResultMetric(label: 'Payoff time', value: payoffText),
              ResultMetric(
                label: 'Future repay',
                value: formatMyr(projection.totalFuturePayment),
              ),
              if (projection.totalFutureInterest > 0)
                ResultMetric(
                  label: 'Interest / profit',
                  value: formatMyr(projection.totalFutureInterest),
                ),
              if (!projection.isPaidOff && projection.endingBalance > 0)
                ResultMetric(
                  label: 'Balance after 50y',
                  value: formatMyr(projection.endingBalance),
                ),
            ],
          ),
          if (!projection.isPaidOff && loan.remainingBalance > 0) ...[
            const SizedBox(height: 8),
            Text(
              'The monthly repayment may not clear this balance within 50 years. Try a higher repayment or check the rate.',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.error,
              ),
            ),
          ],
          if (projection.yearlyPlan.isNotEmpty) ...[
            const SizedBox(height: 4),
            ExpansionTile(
              tilePadding: EdgeInsets.zero,
              childrenPadding: EdgeInsets.zero,
              dense: true,
              title: Text(
                'Yearly payoff path',
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              children: [
                for (final year in projection.yearlyPlan)
                  AmountRow(
                    label: 'Year ${year.year} balance',
                    amount: year.endingBalance,
                  ),
              ],
            ),
          ],
          Divider(color: theme.colorScheme.outlineVariant),
        ],
      ),
    );
  }
}

class OngoingLoanDialog extends StatefulWidget {
  const OngoingLoanDialog({super.key, this.initialLoan});

  final OngoingLoanCommitment? initialLoan;

  @override
  State<OngoingLoanDialog> createState() => _OngoingLoanDialogState();
}

class _OngoingLoanDialogState extends State<OngoingLoanDialog> {
  final _nameController = TextEditingController();
  final _monthlyPaymentController = TextEditingController();
  final _remainingBalanceController = TextEditingController();
  final _annualRateController = TextEditingController();
  OngoingLoanType _type = OngoingLoanType.home;
  String? _error;

  @override
  void initState() {
    super.initState();
    final loan = widget.initialLoan;
    if (loan == null) {
      return;
    }

    _type = loan.type;
    _nameController.text = loan.name;
    _monthlyPaymentController.text = formatEditableAmount(loan.monthlyPayment);
    _remainingBalanceController.text = formatEditableAmount(
      loan.remainingBalance,
    );
    _annualRateController.text = loan.annualRatePercent == 0
        ? ''
        : formatEditablePercent(loan.annualRatePercent);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _monthlyPaymentController.dispose();
    _remainingBalanceController.dispose();
    _annualRateController.dispose();
    super.dispose();
  }

  void _submit() {
    try {
      final now = DateTime.now();
      final existingLoan = widget.initialLoan;
      final name = _nameController.text.trim().isEmpty
          ? _type.label
          : _nameController.text.trim();
      final loan = OngoingLoanCommitment(
        id: existingLoan?.id ?? createScenarioId(now),
        name: name,
        type: _type,
        monthlyPayment: _parseMoney(_monthlyPaymentController.text),
        remainingBalance: _parseOptionalMoney(_remainingBalanceController.text),
        annualRatePercent: _parseOptionalPercent(_annualRateController.text),
        createdAt: existingLoan?.createdAt ?? now,
      );
      Navigator.of(context).pop(loan);
    } on FormatException catch (error) {
      setState(() {
        _error = error.message;
      });
    } on ArgumentError catch (error) {
      setState(() {
        _error = error.message ?? 'Check the input values.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.initialLoan != null;

    return AlertDialog(
      title: Text(isEditing ? 'Edit actual loan' : 'Add actual loan'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            DropdownButtonFormField<OngoingLoanType>(
              initialValue: _type,
              decoration: const InputDecoration(
                labelText: 'Loan type',
                prefixIcon: Icon(Icons.category_outlined),
              ),
              items: [
                for (final type in OngoingLoanType.values)
                  DropdownMenuItem(value: type, child: Text(type.label)),
              ],
              onChanged: (value) {
                if (value == null) {
                  return;
                }
                setState(() {
                  _type = value;
                });
              },
            ),
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Name',
                prefixIcon: Icon(Icons.drive_file_rename_outline),
              ),
            ),
            TextField(
              controller: _monthlyPaymentController,
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
              decoration: const InputDecoration(
                labelText: 'Monthly payment',
                prefixText: 'RM ',
                prefixIcon: Icon(Icons.payments_outlined),
                helperText: 'Actual repayment you pay every month.',
              ),
            ),
            TextField(
              controller: _remainingBalanceController,
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
              decoration: const InputDecoration(
                labelText: 'Outstanding balance',
                prefixText: 'RM ',
                prefixIcon: Icon(Icons.account_balance_outlined),
                helperText: 'Current balance from statement or app.',
              ),
            ),
            TextField(
              controller: _annualRateController,
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
              decoration: const InputDecoration(
                labelText: 'Annual rate estimate',
                suffixText: '% p.a.',
                prefixIcon: Icon(Icons.percent_outlined),
                helperText:
                    'Optional. Leave blank for simple balance tracking.',
              ),
            ),
            if (_error != null) ...[
              const SizedBox(height: 10),
              ErrorMessage(message: _error!),
            ],
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        FilledButton.icon(
          onPressed: _submit,
          icon: Icon(isEditing ? Icons.save_outlined : Icons.add_outlined),
          label: Text(isEditing ? 'Save' : 'Add'),
        ),
      ],
    );
  }
}

class CarLoanScreen extends StatefulWidget {
  const CarLoanScreen({super.key, this.initialScenario});

  final ConsumerLoanScenario? initialScenario;

  @override
  State<CarLoanScreen> createState() => _CarLoanScreenState();
}

class _CarLoanScreenState extends State<CarLoanScreen> {
  final _vehiclePriceController = TextEditingController(text: '90000');
  final _downPaymentController = TextEditingController(text: '10');
  final _flatRateController = TextEditingController(text: '3.00');
  final _tenureController = TextEditingController(text: '7');
  final _upfrontFeesController = TextEditingController(text: '0');
  final _calculator = const MalaysiaConsumerLoanCalculator();

  CarLoanResult? _result;
  String? _error;

  @override
  void initState() {
    super.initState();
    if (widget.initialScenario case final scenario?) {
      _applyScenario(scenario, updateState: false);
    }
    _calculate(updateState: false);
  }

  @override
  void dispose() {
    _vehiclePriceController.dispose();
    _downPaymentController.dispose();
    _flatRateController.dispose();
    _tenureController.dispose();
    _upfrontFeesController.dispose();
    super.dispose();
  }

  void _calculate({bool updateState = true}) {
    try {
      final result = _calculator.calculateCarLoan(
        CarLoanInput(
          vehiclePrice: _parseMoney(_vehiclePriceController.text),
          downPaymentPercent: _parsePercent(_downPaymentController.text),
          annualFlatRatePercent: _parsePercent(_flatRateController.text),
          tenureYears: _parseWholeNumber(_tenureController.text),
          upfrontFees: _parseOptionalMoney(_upfrontFeesController.text),
        ),
      );

      void apply() {
        _result = result;
        _error = null;
      }

      if (updateState) {
        setState(apply);
      } else {
        apply();
      }
    } on FormatException catch (error) {
      _setError(error.message, updateState);
    } on ArgumentError catch (error) {
      _setError(error.message ?? 'Check the input values.', updateState);
    }
  }

  void _setError(String message, bool updateState) {
    if (updateState) {
      setState(() {
        _error = message;
      });
    } else {
      _error = message;
    }
  }

  Future<void> _openSavedScenarios() async {
    final scenario = await Navigator.of(context).push<ConsumerLoanScenario>(
      MaterialPageRoute<ConsumerLoanScenario>(
        builder: (_) => const SavedScenariosScreen(
          selectionMode: true,
          filterType: SavedScenarioType.carLoan,
        ),
      ),
    );

    if (scenario == null) {
      return;
    }

    _applyScenario(scenario);
    _calculate();
  }

  Future<void> _saveCurrentScenario() async {
    _calculate();

    if (_error != null || _result == null) {
      return;
    }

    final name = await showDialog<String>(
      context: context,
      builder: (context) =>
          SaveScenarioDialog(initialName: _defaultScenarioName()),
    );

    if (name == null || name.trim().isEmpty || !mounted) {
      return;
    }

    final now = DateTime.now();
    final scenario = _buildScenario(
      id: createScenarioId(now),
      name: name.trim(),
      createdAt: now,
    );
    await ConsumerScenarioRepository().save(scenario);

    if (!mounted) {
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Saved "${scenario.name}" on this device.')),
    );
  }

  ConsumerLoanScenario _buildScenario({
    required String id,
    required String name,
    required DateTime createdAt,
  }) {
    final result = _result;
    if (result == null) {
      throw StateError('Calculate before saving.');
    }

    return ConsumerLoanScenario(
      id: id,
      name: name,
      createdAt: createdAt,
      type: SavedScenarioType.carLoan,
      amount: _parseMoney(_vehiclePriceController.text),
      downPaymentPercent: _parsePercent(_downPaymentController.text),
      annualRatePercent: _parsePercent(_flatRateController.text),
      tenureYears: _parseWholeNumber(_tenureController.text),
      upfrontFees: _parseOptionalMoney(_upfrontFeesController.text),
      resultMonthlyPayment: result.monthlyInstallment,
      totalInterest: result.totalInterest,
      totalRepayment: result.totalRepayment,
      upfrontCash: result.upfrontCash,
    );
  }

  void _applyScenario(
    ConsumerLoanScenario scenario, {
    bool updateState = true,
  }) {
    void apply() {
      _vehiclePriceController.text = formatEditableAmount(scenario.amount);
      _downPaymentController.text = formatEditablePercent(
        scenario.downPaymentPercent,
      );
      _flatRateController.text = formatEditablePercent(
        scenario.annualRatePercent,
      );
      _tenureController.text = scenario.tenureYears.toString();
      _upfrontFeesController.text = formatEditableAmount(scenario.upfrontFees);
    }

    if (updateState) {
      setState(apply);
    } else {
      apply();
    }
  }

  String _defaultScenarioName() {
    return 'Car ${formatMyr(_parseMoney(_vehiclePriceController.text))}';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Car Loan'),
        actions: [
          IconButton(
            tooltip: 'Assumptions and sources',
            icon: const Icon(Icons.fact_check_outlined),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => const AssumptionsSourcesScreen(),
                ),
              );
            },
          ),
          IconButton(
            tooltip: 'Saved scenarios',
            icon: const Icon(Icons.bookmarks_outlined),
            onPressed: _openSavedScenarios,
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
          children: [
            Text(
              'Hire purchase estimate',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Hire purchase planning using a flat-rate estimate. Replace rates and fees with actual bank quotes.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 18),
            FinanceTextField(
              controller: _vehiclePriceController,
              label: 'Vehicle price',
              prefixText: 'RM ',
              icon: Icons.directions_car_outlined,
              infoTitle: 'Vehicle price',
              infoMessage:
                  'Use the car price before down payment. Insurance, road tax, accessories, and dealer fees may be separate.',
            ),
            FinanceTextField(
              controller: _downPaymentController,
              label: 'Down payment',
              suffixText: '%',
              icon: Icons.payments_outlined,
              infoTitle: 'Down payment',
              infoMessage:
                  'The upfront portion paid by you. A higher down payment lowers the financed amount and monthly installment.',
            ),
            FinanceTextField(
              controller: _flatRateController,
              label: 'Flat interest rate',
              suffixText: '% p.a.',
              icon: Icons.percent_outlined,
              infoTitle: 'Flat interest rate',
              infoMessage:
                  'Many Malaysia car hire purchase quotes use flat rate. The app also estimates an effective reducing-balance rate for comparison.',
            ),
            FinanceTextField(
              controller: _tenureController,
              label: 'Tenure',
              suffixText: 'years',
              icon: Icons.schedule_outlined,
              isWholeNumber: true,
              infoTitle: 'Tenure',
              infoMessage:
                  'The repayment period. Longer tenure reduces monthly payment but usually increases total interest.',
            ),
            FinanceTextField(
              controller: _upfrontFeesController,
              label: 'Upfront fee buffer',
              prefixText: 'RM ',
              icon: Icons.receipt_outlined,
              infoTitle: 'Upfront fee buffer',
              infoMessage:
                  'Optional estimate for processing, registration, or other upfront costs not included in the car price.',
            ),
            const SizedBox(height: 4),
            FilledButton.icon(
              onPressed: _calculate,
              icon: const Icon(Icons.calculate_outlined),
              label: const Text('Calculate'),
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              ErrorMessage(message: _error!),
            ],
            if (_result != null) ...[
              const SizedBox(height: 18),
              ConsumerLoanSummary(
                title: 'Estimated monthly installment',
                primaryValue: formatMyr(_result!.monthlyInstallment),
                subtitle:
                    'Amount financed ${formatMyr(_result!.amountFinanced)} after ${formatMyr(_result!.downPaymentAmount)} down payment.',
                metrics: [
                  ResultMetric(
                    label: 'Total interest',
                    value: formatMyr(_result!.totalInterest),
                  ),
                  ResultMetric(
                    label: 'Effective rate est.',
                    value: formatPercent(_result!.effectiveAnnualRatePercent),
                  ),
                  ResultMetric(
                    label: 'Total repayment',
                    value: formatMyr(_result!.totalRepayment),
                  ),
                  ResultMetric(
                    label: 'Upfront cash',
                    value: formatMyr(_result!.upfrontCash),
                  ),
                ],
                notes: const [
                  'Car hire purchase often quotes flat rates. The effective reducing-balance equivalent helps compare against other financing.',
                  'Actual approval, insurance, road tax, valuation, and early settlement figures can differ by bank and dealer.',
                ],
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: _saveCurrentScenario,
                icon: const Icon(Icons.bookmark_add_outlined),
                label: const Text('Save scenario on this device'),
              ),
              const SizedBox(height: 12),
              SectionPanel(
                title: 'Repayment breakdown',
                icon: Icons.receipt_long_outlined,
                children: [
                  AmountRow(
                    label: 'Vehicle price',
                    amount: _result!.vehiclePrice,
                  ),
                  AmountRow(
                    label: 'Down payment',
                    amount: _result!.downPaymentAmount,
                  ),
                  AmountRow(
                    label: 'Amount financed',
                    amount: _result!.amountFinanced,
                  ),
                  AmountRow(
                    label: 'Flat interest',
                    amount: _result!.totalInterest,
                  ),
                  const Divider(height: 20),
                  AmountRow(
                    label: 'Total repayment',
                    amount: _result!.totalRepayment,
                    isStrong: true,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              LoanPlanPreview(
                title: 'Repayment preview',
                yearlyPlan: _result!.yearlyRepaymentPlan,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class PersonalLoanScreen extends StatefulWidget {
  const PersonalLoanScreen({super.key, this.initialScenario});

  final ConsumerLoanScenario? initialScenario;

  @override
  State<PersonalLoanScreen> createState() => _PersonalLoanScreenState();
}

class _PersonalLoanScreenState extends State<PersonalLoanScreen> {
  final _principalController = TextEditingController(text: '20000');
  final _interestRateController = TextEditingController(text: '8.00');
  final _tenureController = TextEditingController(text: '5');
  final _upfrontFeesController = TextEditingController(text: '0');
  final _stampDutyRateController = TextEditingController(text: '0.50');
  final _calculator = const MalaysiaConsumerLoanCalculator();
  PersonalLoanInterestMethod _interestMethod =
      PersonalLoanInterestMethod.reducingBalance;

  PersonalLoanResult? _result;
  String? _error;

  @override
  void initState() {
    super.initState();
    if (widget.initialScenario case final scenario?) {
      _applyScenario(scenario, updateState: false);
    }
    _calculate(updateState: false);
  }

  @override
  void dispose() {
    _principalController.dispose();
    _interestRateController.dispose();
    _tenureController.dispose();
    _upfrontFeesController.dispose();
    _stampDutyRateController.dispose();
    super.dispose();
  }

  void _calculate({bool updateState = true}) {
    try {
      final result = _calculator.calculatePersonalLoan(
        PersonalLoanInput(
          principal: _parseMoney(_principalController.text),
          annualInterestRatePercent: _parsePercent(
            _interestRateController.text,
          ),
          tenureYears: _parseWholeNumber(_tenureController.text),
          upfrontFees: _parseOptionalMoney(_upfrontFeesController.text),
          stampDutyRatePercent: _parseOptionalPercent(
            _stampDutyRateController.text,
          ),
          interestMethod: _interestMethod,
        ),
      );

      void apply() {
        _result = result;
        _error = null;
      }

      if (updateState) {
        setState(apply);
      } else {
        apply();
      }
    } on FormatException catch (error) {
      _setError(error.message, updateState);
    } on ArgumentError catch (error) {
      _setError(error.message ?? 'Check the input values.', updateState);
    }
  }

  void _setError(String message, bool updateState) {
    if (updateState) {
      setState(() {
        _error = message;
      });
    } else {
      _error = message;
    }
  }

  Future<void> _openSavedScenarios() async {
    final scenario = await Navigator.of(context).push<ConsumerLoanScenario>(
      MaterialPageRoute<ConsumerLoanScenario>(
        builder: (_) => const SavedScenariosScreen(
          selectionMode: true,
          filterType: SavedScenarioType.personalLoan,
        ),
      ),
    );

    if (scenario == null) {
      return;
    }

    _applyScenario(scenario);
    _calculate();
  }

  Future<void> _saveCurrentScenario() async {
    _calculate();

    if (_error != null || _result == null) {
      return;
    }

    final name = await showDialog<String>(
      context: context,
      builder: (context) =>
          SaveScenarioDialog(initialName: _defaultScenarioName()),
    );

    if (name == null || name.trim().isEmpty || !mounted) {
      return;
    }

    final now = DateTime.now();
    final scenario = _buildScenario(
      id: createScenarioId(now),
      name: name.trim(),
      createdAt: now,
    );
    await ConsumerScenarioRepository().save(scenario);

    if (!mounted) {
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Saved "${scenario.name}" on this device.')),
    );
  }

  ConsumerLoanScenario _buildScenario({
    required String id,
    required String name,
    required DateTime createdAt,
  }) {
    final result = _result;
    if (result == null) {
      throw StateError('Calculate before saving.');
    }

    return ConsumerLoanScenario(
      id: id,
      name: name,
      createdAt: createdAt,
      type: SavedScenarioType.personalLoan,
      amount: _parseMoney(_principalController.text),
      annualRatePercent: _parsePercent(_interestRateController.text),
      tenureYears: _parseWholeNumber(_tenureController.text),
      upfrontFees: _parseOptionalMoney(_upfrontFeesController.text),
      stampDutyRatePercent: _parseOptionalPercent(
        _stampDutyRateController.text,
      ),
      calculationMethod: _interestMethod.name,
      resultMonthlyPayment: result.monthlyInstallment,
      totalInterest: result.totalInterest,
      totalRepayment: result.totalRepayment,
      upfrontCash: result.upfrontFees + result.stampDutyEstimate,
    );
  }

  void _applyScenario(
    ConsumerLoanScenario scenario, {
    bool updateState = true,
  }) {
    void apply() {
      _principalController.text = formatEditableAmount(scenario.amount);
      _interestRateController.text = formatEditablePercent(
        scenario.annualRatePercent,
      );
      _tenureController.text = scenario.tenureYears.toString();
      _upfrontFeesController.text = formatEditableAmount(scenario.upfrontFees);
      _stampDutyRateController.text = formatEditablePercent(
        scenario.stampDutyRatePercent == 0
            ? 0.5
            : scenario.stampDutyRatePercent,
      );
      _interestMethod = personalLoanMethodFromName(scenario.calculationMethod);
    }

    if (updateState) {
      setState(apply);
    } else {
      apply();
    }
  }

  String _defaultScenarioName() {
    return 'Personal ${formatMyr(_parseMoney(_principalController.text))}';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Personal Loan'),
        actions: [
          IconButton(
            tooltip: 'Assumptions and sources',
            icon: const Icon(Icons.fact_check_outlined),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => const AssumptionsSourcesScreen(),
                ),
              );
            },
          ),
          IconButton(
            tooltip: 'Saved scenarios',
            icon: const Icon(Icons.bookmarks_outlined),
            onPressed: _openSavedScenarios,
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
          children: [
            Text(
              'Repayment estimate',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Malaysia personal loan planning with selectable reducing-balance or flat-rate method.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 18),
            SectionPanel(
              title: 'Rate method',
              icon: Icons.rule_outlined,
              infoTitle: 'Rate method',
              infoMessage:
                  'Reducing balance is closer to common amortized loans. Flat rate may match some quoted personal-loan offers. Use the method shown in the bank offer.',
              children: [
                PersonalLoanMethodSelector(
                  selected: _interestMethod,
                  onChanged: (method) {
                    setState(() {
                      _interestMethod = method;
                    });
                    _calculate();
                  },
                ),
                const SizedBox(height: 10),
                Text(
                  'Use reducing balance for amortized offers. Use flat when the bank/dealer quotes a flat personal-loan rate.',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            FinanceTextField(
              controller: _principalController,
              label: 'Loan amount',
              prefixText: 'RM ',
              icon: Icons.account_balance_wallet_outlined,
              infoTitle: 'Loan amount',
              infoMessage:
                  'The principal you plan to borrow before interest, stamp duty, and other fees.',
            ),
            FinanceTextField(
              controller: _interestRateController,
              label: 'Interest rate',
              suffixText: '% p.a.',
              icon: Icons.percent_outlined,
              infoTitle: 'Interest rate',
              infoMessage:
                  'Enter the annual rate quoted by the lender. Match this with the selected reducing or flat method.',
            ),
            FinanceTextField(
              controller: _tenureController,
              label: 'Tenure',
              suffixText: 'years',
              icon: Icons.schedule_outlined,
              isWholeNumber: true,
              infoTitle: 'Tenure',
              infoMessage:
                  'Repayment period in years. Longer tenure lowers the monthly repayment but may increase total interest.',
            ),
            FinanceTextField(
              controller: _upfrontFeesController,
              label: 'Processing / other fee buffer',
              prefixText: 'RM ',
              icon: Icons.receipt_outlined,
              infoTitle: 'Processing fees',
              infoMessage:
                  'Editable buffer for lender processing fees or other charges. Set to zero if the offer has none.',
            ),
            FinanceTextField(
              controller: _stampDutyRateController,
              label: 'Loan agreement stamp duty',
              suffixText: '%',
              icon: Icons.description_outlined,
              infoTitle: 'Loan agreement stamp duty',
              infoMessage:
                  'An editable estimate for loan document stamp duty. Confirm the actual figure from the lender or legal documents.',
            ),
            const SizedBox(height: 4),
            FilledButton.icon(
              onPressed: _calculate,
              icon: const Icon(Icons.calculate_outlined),
              label: const Text('Calculate'),
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              ErrorMessage(message: _error!),
            ],
            if (_result != null) ...[
              const SizedBox(height: 18),
              ConsumerLoanSummary(
                title: 'Estimated monthly repayment',
                primaryValue: formatMyr(_result!.monthlyInstallment),
                subtitle:
                    'Loan amount ${formatMyr(_result!.principal)} over ${_tenureController.text.trim()} years.',
                metrics: [
                  ResultMetric(
                    label: 'Method',
                    value: personalLoanMethodLabel(_result!.interestMethod),
                  ),
                  ResultMetric(
                    label: 'Effective rate est.',
                    value: formatPercent(_result!.effectiveAnnualRatePercent),
                  ),
                  ResultMetric(
                    label: 'Total interest',
                    value: formatMyr(_result!.totalInterest),
                  ),
                  ResultMetric(
                    label: 'Stamp duty est.',
                    value: formatMyr(_result!.stampDutyEstimate),
                  ),
                  ResultMetric(
                    label: 'Upfront fees',
                    value: formatMyr(_result!.upfrontFees),
                  ),
                  ResultMetric(
                    label: 'Total cost',
                    value: formatMyr(_result!.totalCost),
                  ),
                  ResultMetric(
                    label: 'Total repayment',
                    value: formatMyr(_result!.totalRepayment),
                  ),
                ],
                notes: const [
                  'Loan agreement stamp duty is shown as an editable estimate because actual documents and promotions can vary.',
                  'Some personal loans quote flat rates or include fees differently. Match the method to the bank offer letter when available.',
                  'This does not predict approval or credit eligibility.',
                ],
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: _saveCurrentScenario,
                icon: const Icon(Icons.bookmark_add_outlined),
                label: const Text('Save scenario on this device'),
              ),
              const SizedBox(height: 12),
              LoanPlanPreview(
                title: 'Amortization preview',
                yearlyPlan: _result!.yearlyRepaymentPlan,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class CreditCardScreen extends StatefulWidget {
  const CreditCardScreen({super.key, this.initialScenario});

  final ConsumerLoanScenario? initialScenario;

  @override
  State<CreditCardScreen> createState() => _CreditCardScreenState();
}

class _CreditCardScreenState extends State<CreditCardScreen> {
  final _balanceController = TextEditingController(text: '5000');
  final _financeChargeController = TextEditingController(text: '18.00');
  final _monthlyPaymentController = TextEditingController(text: '500');
  final _newSpendingController = TextEditingController(text: '0');
  final _minimumPaymentPercentController = TextEditingController(text: '5');
  final _minimumPaymentFloorController = TextEditingController(text: '50');
  final _calculator = const MalaysiaConsumerLoanCalculator();

  CreditCardPayoffResult? _result;
  String? _error;

  @override
  void initState() {
    super.initState();
    if (widget.initialScenario case final scenario?) {
      _applyScenario(scenario, updateState: false);
    }
    _calculate(updateState: false);
  }

  @override
  void dispose() {
    _balanceController.dispose();
    _financeChargeController.dispose();
    _monthlyPaymentController.dispose();
    _newSpendingController.dispose();
    _minimumPaymentPercentController.dispose();
    _minimumPaymentFloorController.dispose();
    super.dispose();
  }

  void _calculate({bool updateState = true}) {
    try {
      final result = _calculator.calculateCreditCardPayoff(
        CreditCardPayoffInput(
          outstandingBalance: _parseMoney(_balanceController.text),
          annualFinanceChargePercent: _parsePercent(
            _financeChargeController.text,
          ),
          monthlyPayment: _parseMoney(_monthlyPaymentController.text),
          monthlyNewSpending: _parseOptionalMoney(_newSpendingController.text),
          minimumPaymentPercent: _parseOptionalPercent(
            _minimumPaymentPercentController.text,
          ),
          minimumPaymentFloor: _parseOptionalMoney(
            _minimumPaymentFloorController.text,
          ),
        ),
      );

      void apply() {
        _result = result;
        _error = null;
      }

      if (updateState) {
        setState(apply);
      } else {
        apply();
      }
    } on FormatException catch (error) {
      _setError(error.message, updateState);
    } on ArgumentError catch (error) {
      _setError(error.message ?? 'Check the input values.', updateState);
    }
  }

  void _setError(String message, bool updateState) {
    if (updateState) {
      setState(() {
        _error = message;
      });
    } else {
      _error = message;
    }
  }

  Future<void> _openSavedScenarios() async {
    final scenario = await Navigator.of(context).push<ConsumerLoanScenario>(
      MaterialPageRoute<ConsumerLoanScenario>(
        builder: (_) => const SavedScenariosScreen(
          selectionMode: true,
          filterType: SavedScenarioType.creditCard,
        ),
      ),
    );

    if (scenario == null) {
      return;
    }

    _applyScenario(scenario);
    _calculate();
  }

  Future<void> _saveCurrentScenario() async {
    _calculate();

    if (_error != null || _result == null) {
      return;
    }

    final name = await showDialog<String>(
      context: context,
      builder: (context) =>
          SaveScenarioDialog(initialName: _defaultScenarioName()),
    );

    if (name == null || name.trim().isEmpty || !mounted) {
      return;
    }

    final now = DateTime.now();
    final scenario = _buildScenario(
      id: createScenarioId(now),
      name: name.trim(),
      createdAt: now,
    );
    await ConsumerScenarioRepository().save(scenario);

    if (!mounted) {
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Saved "${scenario.name}" on this device.')),
    );
  }

  ConsumerLoanScenario _buildScenario({
    required String id,
    required String name,
    required DateTime createdAt,
  }) {
    final result = _result;
    if (result == null) {
      throw StateError('Calculate before saving.');
    }

    return ConsumerLoanScenario(
      id: id,
      name: name,
      createdAt: createdAt,
      type: SavedScenarioType.creditCard,
      amount: _parseMoney(_balanceController.text),
      annualRatePercent: _parsePercent(_financeChargeController.text),
      monthlyPaymentInput: _parseMoney(_monthlyPaymentController.text),
      monthlyNewSpending: _parseOptionalMoney(_newSpendingController.text),
      minimumPaymentPercent: _parseOptionalPercent(
        _minimumPaymentPercentController.text,
      ),
      minimumPaymentFloor: _parseOptionalMoney(
        _minimumPaymentFloorController.text,
      ),
      resultMonthlyPayment: _parseMoney(_monthlyPaymentController.text),
      totalInterest: result.totalInterest,
      totalRepayment: result.totalPaid,
      payoffMonths: result.monthsToPayoff,
      isPaidOff: result.isPaidOff,
      remainingBalance: result.remainingBalance,
    );
  }

  void _applyScenario(
    ConsumerLoanScenario scenario, {
    bool updateState = true,
  }) {
    void apply() {
      _balanceController.text = formatEditableAmount(scenario.amount);
      _financeChargeController.text = formatEditablePercent(
        scenario.annualRatePercent,
      );
      _monthlyPaymentController.text = formatEditableAmount(
        scenario.monthlyPaymentInput,
      );
      _newSpendingController.text = formatEditableAmount(
        scenario.monthlyNewSpending,
      );
      _minimumPaymentPercentController.text = formatEditablePercent(
        scenario.minimumPaymentPercent,
      );
      _minimumPaymentFloorController.text = formatEditableAmount(
        scenario.minimumPaymentFloor,
      );
    }

    if (updateState) {
      setState(apply);
    } else {
      apply();
    }
  }

  String _defaultScenarioName() {
    return 'Card ${formatMyr(_parseMoney(_balanceController.text))}';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final result = _result;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Credit Card'),
        actions: [
          IconButton(
            tooltip: 'Assumptions and sources',
            icon: const Icon(Icons.fact_check_outlined),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => const AssumptionsSourcesScreen(),
                ),
              );
            },
          ),
          IconButton(
            tooltip: 'Saved scenarios',
            icon: const Icon(Icons.bookmarks_outlined),
            onPressed: _openSavedScenarios,
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
          children: [
            Text(
              'Payoff projection',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Estimate payoff time and finance charges for a fixed monthly payment.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 18),
            FinanceTextField(
              controller: _balanceController,
              label: 'Outstanding balance',
              prefixText: 'RM ',
              icon: Icons.credit_card_outlined,
              infoTitle: 'Outstanding balance',
              infoMessage:
                  'Your current unpaid card balance. Use the latest statement or app balance for planning.',
            ),
            FinanceTextField(
              controller: _financeChargeController,
              label: 'Finance charge',
              suffixText: '% p.a.',
              icon: Icons.percent_outlined,
              infoTitle: 'Finance charge',
              infoMessage:
                  'The annual credit card interest or finance charge rate. Real cards may calculate daily interest and fees differently.',
            ),
            FinanceTextField(
              controller: _monthlyPaymentController,
              label: 'Monthly payment',
              prefixText: 'RM ',
              icon: Icons.payments_outlined,
              infoTitle: 'Monthly payment',
              infoMessage:
                  'The amount you plan to pay each month. Paying only the minimum can make the balance take much longer to clear.',
            ),
            FinanceTextField(
              controller: _newSpendingController,
              label: 'New spending each month',
              prefixText: 'RM ',
              icon: Icons.shopping_bag_outlined,
              infoTitle: 'New spending',
              infoMessage:
                  'Set this to zero if you want to model stopping new card spending while paying down the balance.',
            ),
            SectionPanel(
              title: 'Minimum payment assumption',
              icon: Icons.rule_outlined,
              infoTitle: 'Minimum payment',
              infoMessage:
                  'Card issuers may use different minimum repayment formulas. This section lets you adjust the assumption for comparison.',
              children: [
                Text(
                  'Editable because card issuers can set different minimum repayment terms.',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 12),
                FinanceTextField(
                  controller: _minimumPaymentPercentController,
                  label: 'Minimum payment',
                  suffixText: '%',
                  icon: Icons.percent_outlined,
                  infoTitle: 'Minimum payment percent',
                  infoMessage:
                      'The estimated percentage of statement balance used to calculate the minimum monthly repayment.',
                ),
                FinanceTextField(
                  controller: _minimumPaymentFloorController,
                  label: 'Minimum payment floor',
                  prefixText: 'RM ',
                  icon: Icons.price_check_outlined,
                  infoTitle: 'Minimum payment floor',
                  infoMessage:
                      'The minimum ringgit amount assumed when the percentage-based minimum would be too low.',
                ),
              ],
            ),
            const SizedBox(height: 14),
            FilledButton.icon(
              onPressed: _calculate,
              icon: const Icon(Icons.calculate_outlined),
              label: const Text('Calculate'),
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              ErrorMessage(message: _error!),
            ],
            if (result != null) ...[
              const SizedBox(height: 18),
              ConsumerLoanSummary(
                title: result.isPaidOff
                    ? 'Estimated payoff time'
                    : 'Balance not cleared',
                primaryValue: result.isPaidOff
                    ? formatMonthsDuration(result.monthsToPayoff)
                    : 'Over 50 years',
                subtitle: result.isPaidOff
                    ? 'At the entered payment, the card balance reaches zero in this estimate.'
                    : 'The entered payment does not clear the balance within the 600-month safety limit.',
                metrics: [
                  ResultMetric(
                    label: 'Total interest',
                    value: formatMyr(result.totalInterest),
                  ),
                  ResultMetric(
                    label: 'Total paid',
                    value: formatMyr(result.totalPaid),
                  ),
                  ResultMetric(
                    label: 'First min. due',
                    value: formatMyr(result.firstMinimumPayment),
                  ),
                  if (!result.isPaidOff)
                    ResultMetric(
                      label: 'Remaining',
                      value: formatMyr(result.remainingBalance),
                    ),
                ],
                notes: [
                  if (result.isBelowFirstMinimumPayment)
                    'The entered payment is below the editable first-month minimum payment assumption.',
                  'This is a simplified month-by-month projection. Real cards may use daily interest, fees, statement dates, and issuer-specific minimums.',
                ],
              ),
              const SizedBox(height: 12),
              CreditCardMinimumComparisonPanel(result: result),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: _saveCurrentScenario,
                icon: const Icon(Icons.bookmark_add_outlined),
                label: const Text('Save scenario on this device'),
              ),
              const SizedBox(height: 12),
              CreditCardPlanPreview(monthlyPlan: result.monthlyPlan),
            ],
          ],
        ),
      ),
    );
  }
}

class PtptnLoanScreen extends StatefulWidget {
  const PtptnLoanScreen({super.key, this.initialScenario});

  final ConsumerLoanScenario? initialScenario;

  @override
  State<PtptnLoanScreen> createState() => _PtptnLoanScreenState();
}

class _PtptnLoanScreenState extends State<PtptnLoanScreen> {
  final _balanceController = TextEditingController(text: '30000');
  final _ujrahRateController = TextEditingController(text: '1.00');
  final _tenureController = TextEditingController(text: '10');
  final _extraPaymentController = TextEditingController(text: '0');
  final _calculator = const MalaysiaConsumerLoanCalculator();
  PtptnServiceChargeMethod _serviceChargeMethod =
      PtptnServiceChargeMethod.reducingBalance;

  PtptnLoanResult? _result;
  String? _error;

  @override
  void initState() {
    super.initState();
    if (widget.initialScenario case final scenario?) {
      _applyScenario(scenario, updateState: false);
    }
    _calculate(updateState: false);
  }

  @override
  void dispose() {
    _balanceController.dispose();
    _ujrahRateController.dispose();
    _tenureController.dispose();
    _extraPaymentController.dispose();
    super.dispose();
  }

  void _calculate({bool updateState = true}) {
    try {
      final result = _calculator.calculatePtptnLoan(
        PtptnLoanInput(
          outstandingBalance: _parseMoney(_balanceController.text),
          annualUjrahRatePercent: _parsePercent(_ujrahRateController.text),
          tenureYears: _parseWholeNumber(_tenureController.text),
          extraMonthlyPayment: _parseOptionalMoney(
            _extraPaymentController.text,
          ),
          serviceChargeMethod: _serviceChargeMethod,
        ),
      );

      void apply() {
        _result = result;
        _error = null;
      }

      if (updateState) {
        setState(apply);
      } else {
        apply();
      }
    } on FormatException catch (error) {
      _setError(error.message, updateState);
    } on ArgumentError catch (error) {
      _setError(error.message ?? 'Check the input values.', updateState);
    }
  }

  void _setError(String message, bool updateState) {
    if (updateState) {
      setState(() {
        _error = message;
      });
    } else {
      _error = message;
    }
  }

  Future<void> _openSavedScenarios() async {
    final scenario = await Navigator.of(context).push<ConsumerLoanScenario>(
      MaterialPageRoute<ConsumerLoanScenario>(
        builder: (_) => const SavedScenariosScreen(
          selectionMode: true,
          filterType: SavedScenarioType.ptptnLoan,
        ),
      ),
    );

    if (scenario == null) {
      return;
    }

    _applyScenario(scenario);
    _calculate();
  }

  Future<void> _saveCurrentScenario() async {
    _calculate();

    if (_error != null || _result == null) {
      return;
    }

    final name = await showDialog<String>(
      context: context,
      builder: (context) =>
          SaveScenarioDialog(initialName: _defaultScenarioName()),
    );

    if (name == null || name.trim().isEmpty || !mounted) {
      return;
    }

    final now = DateTime.now();
    final scenario = _buildScenario(
      id: createScenarioId(now),
      name: name.trim(),
      createdAt: now,
    );
    await ConsumerScenarioRepository().save(scenario);

    if (!mounted) {
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Saved "${scenario.name}" on this device.')),
    );
  }

  ConsumerLoanScenario _buildScenario({
    required String id,
    required String name,
    required DateTime createdAt,
  }) {
    final result = _result;
    if (result == null) {
      throw StateError('Calculate before saving.');
    }

    return ConsumerLoanScenario(
      id: id,
      name: name,
      createdAt: createdAt,
      type: SavedScenarioType.ptptnLoan,
      amount: _parseMoney(_balanceController.text),
      annualRatePercent: _parsePercent(_ujrahRateController.text),
      tenureYears: _parseWholeNumber(_tenureController.text),
      extraMonthlyPayment: _parseOptionalMoney(_extraPaymentController.text),
      calculationMethod: _serviceChargeMethod.name,
      baseMonthlyPayment: result.scheduledMonthlyPayment,
      resultMonthlyPayment: result.plannedMonthlyPayment,
      totalInterest: result.totalServiceCharge,
      totalRepayment: result.totalRepayment,
      payoffMonths: result.payoffMonths,
      finalPayment: result.finalPayment,
    );
  }

  void _applyScenario(
    ConsumerLoanScenario scenario, {
    bool updateState = true,
  }) {
    void apply() {
      _balanceController.text = formatEditableAmount(scenario.amount);
      _ujrahRateController.text = formatEditablePercent(
        scenario.annualRatePercent,
      );
      _tenureController.text = scenario.tenureYears.toString();
      _extraPaymentController.text = formatEditableAmount(
        scenario.extraMonthlyPayment,
      );
      _serviceChargeMethod = ptptnMethodFromName(scenario.calculationMethod);
    }

    if (updateState) {
      setState(apply);
    } else {
      apply();
    }
  }

  String _defaultScenarioName() {
    return 'PTPTN ${formatMyr(_parseMoney(_balanceController.text))}';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final result = _result;

    return Scaffold(
      appBar: AppBar(
        title: const Text('PTPTN Loan'),
        actions: [
          IconButton(
            tooltip: 'Assumptions and sources',
            icon: const Icon(Icons.fact_check_outlined),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => const AssumptionsSourcesScreen(),
                ),
              );
            },
          ),
          IconButton(
            tooltip: 'Saved scenarios',
            icon: const Icon(Icons.bookmarks_outlined),
            onPressed: _openSavedScenarios,
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
          children: [
            Text(
              'Education repayment',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Education loan repayment planning with editable Ujrah assumptions.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 18),
            SectionPanel(
              title: 'Ujrah method',
              icon: Icons.rule_outlined,
              infoTitle: 'Ujrah method',
              infoMessage:
                  'Reducing-balance mode estimates service charge on the declining balance. Flat mode is kept for simplified matching against older planning figures.',
              children: [
                PtptnMethodSelector(
                  selected: _serviceChargeMethod,
                  onChanged: (method) {
                    setState(() {
                      _serviceChargeMethod = method;
                    });
                    _calculate();
                  },
                ),
                const SizedBox(height: 10),
                Text(
                  'Reducing-balance estimates service charge on the declining balance. Flat mode keeps the older simple planning method.',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            FinanceTextField(
              controller: _balanceController,
              label: 'Outstanding balance',
              prefixText: 'RM ',
              icon: Icons.school_outlined,
              infoTitle: 'Outstanding balance',
              infoMessage:
                  'Use the latest amount shown in your PTPTN portal or statement, including any arrears if applicable.',
            ),
            FinanceTextField(
              controller: _ujrahRateController,
              label: 'Ujrah / service charge',
              suffixText: '% p.a.',
              icon: Icons.percent_outlined,
              infoTitle: 'Ujrah / service charge',
              infoMessage:
                  'PTPTN Ujrah is a service charge. This field is editable so you can match your official account terms.',
            ),
            FinanceTextField(
              controller: _tenureController,
              label: 'Target repayment tenure',
              suffixText: 'years',
              icon: Icons.schedule_outlined,
              isWholeNumber: true,
              infoTitle: 'Target repayment tenure',
              infoMessage:
                  'How quickly you want to clear the balance. Shorter tenure raises monthly payment but can reduce total service charge.',
            ),
            FinanceTextField(
              controller: _extraPaymentController,
              label: 'Extra monthly payment',
              prefixText: 'RM ',
              icon: Icons.add_card_outlined,
              infoTitle: 'Extra monthly payment',
              infoMessage:
                  'Additional amount on top of the scheduled payment. Use zero if you only want to plan the base repayment.',
            ),
            const SizedBox(height: 4),
            FilledButton.icon(
              onPressed: _calculate,
              icon: const Icon(Icons.calculate_outlined),
              label: const Text('Calculate'),
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              ErrorMessage(message: _error!),
            ],
            if (result != null) ...[
              const SizedBox(height: 18),
              ConsumerLoanSummary(
                title: 'Estimated monthly repayment',
                primaryValue: formatMyr(result.plannedMonthlyPayment),
                subtitle:
                    'Scheduled amount before extra payment is ${formatMyr(result.scheduledMonthlyPayment)}.',
                metrics: [
                  ResultMetric(
                    label: 'Method',
                    value: ptptnMethodLabel(result.serviceChargeMethod),
                  ),
                  ResultMetric(
                    label: 'Payoff time',
                    value: formatMonthsDuration(result.payoffMonths),
                  ),
                  ResultMetric(
                    label: 'Ujrah estimate',
                    value: formatMyr(result.totalServiceCharge),
                  ),
                  ResultMetric(
                    label: 'Total repayment',
                    value: formatMyr(result.totalRepayment),
                  ),
                  ResultMetric(
                    label: 'Final payment',
                    value: formatMyr(result.finalPayment),
                  ),
                ],
                notes: const [
                  'Confirm your actual repayment schedule, arrears, rebates, and deductions in the official PTPTN portal or statement.',
                  'Discount campaigns, arrears, salary deductions, restructuring, and official account adjustments are not included.',
                ],
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: _saveCurrentScenario,
                icon: const Icon(Icons.bookmark_add_outlined),
                label: const Text('Save scenario on this device'),
              ),
              const SizedBox(height: 12),
              LoanPlanPreview(
                title: 'Repayment preview',
                yearlyPlan: result.yearlyRepaymentPlan,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class ConsumerLoanSummary extends StatelessWidget {
  const ConsumerLoanSummary({
    super.key,
    required this.title,
    required this.primaryValue,
    required this.subtitle,
    required this.metrics,
    required this.notes,
  });

  final String title;
  final String primaryValue;
  final String subtitle;
  final List<Widget> metrics;
  final List<String> notes;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return DecoratedBox(
      decoration: BoxDecoration(
        color: colorScheme.primaryContainer,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: Theme.of(context).textTheme.labelLarge?.copyWith(
                color: colorScheme.onPrimaryContainer,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              primaryValue,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                color: colorScheme.onPrimaryContainer,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              subtitle,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: colorScheme.onPrimaryContainer,
              ),
            ),
            const SizedBox(height: 14),
            Wrap(spacing: 10, runSpacing: 10, children: metrics),
            for (final note in notes) ...[
              const SizedBox(height: 8),
              ResultNote(icon: Icons.info_outline, text: note),
            ],
          ],
        ),
      ),
    );
  }
}

class SalaryPlannerSummary extends StatelessWidget {
  const SalaryPlannerSummary({super.key, required this.result});

  final SalaryPlannerResult result;

  @override
  Widget build(BuildContext context) {
    final status = result.cashflowFitStatus;

    return ConsumerLoanSummary(
      title: 'Estimated take-home pay',
      primaryValue: formatMyr(result.netMonthlyIncome),
      subtitle:
          'Remaining after the evaluated loan is ${formatMyr(result.remainingAfterNewLoan)} before savings target.',
      metrics: [
        ResultMetric(label: 'Loan fit', value: _cashflowFitLabel(status)),
        ResultMetric(
          label: 'DSR after loan',
          value: formatPercent(result.dsrAfterNewLoanPercent),
        ),
        ResultMetric(
          label: 'Suggested max',
          value: formatMyr(result.recommendedMaxInstallment),
        ),
        ResultMetric(
          label: 'After savings',
          value: formatMyr(result.remainingAfterSavingsTarget),
        ),
      ],
      notes: [
        _cashflowFitMessage(status),
        'This is cashflow guidance only. It does not guarantee approval and is not financial, tax, or investment advice.',
      ],
    );
  }
}

class SalaryPlannerBreakdown extends StatelessWidget {
  const SalaryPlannerBreakdown({super.key, required this.result});

  final SalaryPlannerResult result;

  @override
  Widget build(BuildContext context) {
    return SectionPanel(
      title: 'Take-home and affordability',
      icon: Icons.receipt_long_outlined,
      children: [
        AmountRow(
          label: 'EPF employee estimate',
          amount: result.epfEmployeeContribution,
        ),
        AmountRow(
          label: 'SOCSO employee estimate',
          amount: result.socsoEmployeeContribution,
        ),
        AmountRow(
          label: 'EIS employee estimate',
          amount: result.eisEmployeeContribution,
        ),
        AmountRow(label: 'PCB / tax deduction', amount: result.monthlyPcbTax),
        const Divider(height: 20),
        AmountRow(
          label: 'Net monthly income',
          amount: result.netMonthlyIncome,
          isStrong: true,
        ),
        AmountRow(
          label: 'Remaining before new loan',
          amount: result.remainingBeforeNewLoan,
        ),
        AmountRow(
          label: 'Remaining after new loan',
          amount: result.remainingAfterNewLoan,
        ),
        AmountRow(
          label: 'Target monthly savings',
          amount: result.targetMonthlySavings,
        ),
        AmountRow(
          label: 'Max by DSR target',
          amount: result.maxInstallmentByDsr,
        ),
        AmountRow(
          label: 'Max by cashflow target',
          amount: result.maxInstallmentByCashflow,
        ),
      ],
    );
  }
}

class InvestmentCashflowPanel extends StatelessWidget {
  const InvestmentCashflowPanel({super.key, required this.result});

  final SalaryPlannerResult result;

  @override
  Widget build(BuildContext context) {
    final hasInvestmentInput =
        result.grossYieldPercent > 0 || result.netYieldBeforeTaxPercent > 0;

    return SectionPanel(
      title: 'Investment cashflow view',
      icon: Icons.trending_up_outlined,
      children: [
        if (!hasInvestmentInput)
          Text(
            'Enter asset price, expected income, and upkeep costs to estimate yield and monthly investment cashflow.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          )
        else ...[
          AmountRow(
            label: 'Monthly cashflow before tax',
            amount: result.monthlyInvestmentCashflow,
            isStrong: true,
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              ResultMetric(
                label: 'Gross yield',
                value: formatPercent(result.grossYieldPercent),
              ),
              ResultMetric(
                label: 'Net yield before tax',
                value: formatPercent(result.netYieldBeforeTaxPercent),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            'Yield rows above are percentages. Positive cashflow is useful, but investment quality also depends on entry price, vacancy, repairs, legal risk, liquidity, taxes, and opportunity cost.',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ],
    );
  }
}

String _cashflowFitLabel(CashflowFitStatus status) {
  return switch (status) {
    CashflowFitStatus.comfortable => 'Comfortable',
    CashflowFitStatus.review => 'Review',
    CashflowFitStatus.highPressure => 'High pressure',
    CashflowFitStatus.unavailable => 'N/A',
  };
}

String _cashflowFitMessage(CashflowFitStatus status) {
  return switch (status) {
    CashflowFitStatus.comfortable =>
      'The evaluated installment is within the selected DSR and cashflow targets.',
    CashflowFitStatus.review =>
      'This installment is close to your selected limits. Review emergency buffer, expenses, and rate changes.',
    CashflowFitStatus.highPressure =>
      'This installment may put heavy pressure on monthly cashflow under the selected assumptions.',
    CashflowFitStatus.unavailable =>
      'Enter a loan installment and target DSR to evaluate loan fit.',
  };
}

String personalLoanMethodLabel(PersonalLoanInterestMethod method) {
  return switch (method) {
    PersonalLoanInterestMethod.reducingBalance => 'Reducing',
    PersonalLoanInterestMethod.flatRate => 'Flat',
  };
}

String ptptnMethodLabel(PtptnServiceChargeMethod method) {
  return switch (method) {
    PtptnServiceChargeMethod.reducingBalance => 'Reducing',
    PtptnServiceChargeMethod.flatRate => 'Flat',
  };
}

PersonalLoanInterestMethod personalLoanMethodFromName(String name) {
  for (final method in PersonalLoanInterestMethod.values) {
    if (method.name == name) {
      return method;
    }
  }

  return PersonalLoanInterestMethod.reducingBalance;
}

PtptnServiceChargeMethod ptptnMethodFromName(String name) {
  for (final method in PtptnServiceChargeMethod.values) {
    if (method.name == name) {
      return method;
    }
  }

  return PtptnServiceChargeMethod.reducingBalance;
}

class LoanPlanPreview extends StatelessWidget {
  const LoanPlanPreview({
    super.key,
    required this.title,
    required this.yearlyPlan,
  });

  final String title;
  final List<LoanYearSummary> yearlyPlan;

  @override
  Widget build(BuildContext context) {
    return SectionPanel(
      title: title,
      icon: Icons.table_chart_outlined,
      children: [
        for (final year in yearlyPlan)
          AmountRow(
            label: 'Year ${year.year} remaining',
            amount: year.endingBalance,
          ),
      ],
    );
  }
}

class CreditCardPlanPreview extends StatelessWidget {
  const CreditCardPlanPreview({super.key, required this.monthlyPlan});

  final List<CreditCardMonthSummary> monthlyPlan;

  @override
  Widget build(BuildContext context) {
    return SectionPanel(
      title: 'First 12-month preview',
      icon: Icons.table_chart_outlined,
      children: [
        for (final month in monthlyPlan)
          AmountRow(
            label: 'Month ${month.month} balance',
            amount: month.endingBalance,
          ),
      ],
    );
  }
}

class CreditCardMinimumComparisonPanel extends StatelessWidget {
  const CreditCardMinimumComparisonPanel({super.key, required this.result});

  final CreditCardPayoffResult result;

  @override
  Widget build(BuildContext context) {
    final minimumPayoffText = result.minimumOnlyIsPaidOff
        ? formatMonthsDuration(result.minimumOnlyMonthsToPayoff)
        : 'Over 50 years';
    final interestDifference =
        result.minimumOnlyTotalInterest - result.totalInterest;

    return SectionPanel(
      title: 'Minimum-payment comparison',
      icon: Icons.compare_arrows_outlined,
      children: [
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: [
            ResultMetric(
              label: 'Minimum-only payoff',
              value: minimumPayoffText,
            ),
            ResultMetric(
              label: 'Minimum-only interest',
              value: formatMyr(result.minimumOnlyTotalInterest),
            ),
            ResultMetric(
              label: 'Interest avoided',
              value: formatMyr(interestDifference < 0 ? 0 : interestDifference),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          'Minimum-payment mode recalculates the payment each month from the editable minimum assumption. It is a planning comparison, not a card statement.',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}

class FinanceTextField extends StatelessWidget {
  const FinanceTextField({
    super.key,
    required this.controller,
    required this.label,
    required this.icon,
    this.prefixText,
    this.suffixText,
    this.infoTitle,
    this.infoMessage,
    this.isWholeNumber = false,
    this.onChanged,
  });

  final TextEditingController controller;
  final String label;
  final IconData icon;
  final String? prefixText;
  final String? suffixText;
  final String? infoTitle;
  final String? infoMessage;
  final bool isWholeNumber;
  final ValueChanged<String>? onChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: TextField(
        controller: controller,
        onChanged: onChanged,
        keyboardType: TextInputType.numberWithOptions(decimal: !isWholeNumber),
        decoration: InputDecoration(
          labelText: label,
          prefixText: prefixText,
          suffixText: suffixText,
          prefixIcon: Icon(icon),
          suffixIcon: infoMessage == null
              ? null
              : IconButton(
                  tooltip: infoTitle ?? 'More info',
                  icon: const Icon(Icons.info_outline),
                  onPressed: () {
                    showInfoDialog(
                      context,
                      title: infoTitle ?? label,
                      message: infoMessage!,
                    );
                  },
                ),
          filled: true,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        ),
      ),
    );
  }
}

class PurchaseTypeSelector extends StatelessWidget {
  const PurchaseTypeSelector({
    super.key,
    required this.selected,
    required this.onChanged,
  });

  final HomePurchaseType selected;
  final ValueChanged<HomePurchaseType> onChanged;

  @override
  Widget build(BuildContext context) {
    return SegmentedButton<HomePurchaseType>(
      showSelectedIcon: false,
      segments: const [
        ButtonSegment(
          value: HomePurchaseType.subsale,
          icon: Icon(Icons.key_outlined),
          label: Text('Subsale'),
        ),
        ButtonSegment(
          value: HomePurchaseType.hdaNewProject,
          icon: Icon(Icons.apartment_outlined),
          label: Text('New project'),
        ),
      ],
      selected: {selected},
      onSelectionChanged: (selection) {
        onChanged(selection.first);
      },
    );
  }
}

class FinancingTypeSelector extends StatelessWidget {
  const FinancingTypeSelector({
    super.key,
    required this.selected,
    required this.onChanged,
  });

  final HomeFinancingType selected;
  final ValueChanged<HomeFinancingType> onChanged;

  @override
  Widget build(BuildContext context) {
    return SegmentedButton<HomeFinancingType>(
      showSelectedIcon: false,
      segments: const [
        ButtonSegment(
          value: HomeFinancingType.conventional,
          icon: Icon(Icons.account_balance_outlined),
          label: Text('Conventional'),
        ),
        ButtonSegment(
          value: HomeFinancingType.islamic,
          icon: Icon(Icons.mosque_outlined),
          label: Text('Islamic'),
        ),
      ],
      selected: {selected},
      onSelectionChanged: (selection) {
        onChanged(selection.first);
      },
    );
  }
}

class PersonalLoanMethodSelector extends StatelessWidget {
  const PersonalLoanMethodSelector({
    super.key,
    required this.selected,
    required this.onChanged,
  });

  final PersonalLoanInterestMethod selected;
  final ValueChanged<PersonalLoanInterestMethod> onChanged;

  @override
  Widget build(BuildContext context) {
    return SegmentedButton<PersonalLoanInterestMethod>(
      showSelectedIcon: false,
      segments: const [
        ButtonSegment(
          value: PersonalLoanInterestMethod.reducingBalance,
          icon: Icon(Icons.timeline_outlined),
          label: Text('Reducing'),
        ),
        ButtonSegment(
          value: PersonalLoanInterestMethod.flatRate,
          icon: Icon(Icons.horizontal_rule_outlined),
          label: Text('Flat'),
        ),
      ],
      selected: {selected},
      onSelectionChanged: (selection) {
        onChanged(selection.first);
      },
    );
  }
}

class PtptnMethodSelector extends StatelessWidget {
  const PtptnMethodSelector({
    super.key,
    required this.selected,
    required this.onChanged,
  });

  final PtptnServiceChargeMethod selected;
  final ValueChanged<PtptnServiceChargeMethod> onChanged;

  @override
  Widget build(BuildContext context) {
    return SegmentedButton<PtptnServiceChargeMethod>(
      showSelectedIcon: false,
      segments: const [
        ButtonSegment(
          value: PtptnServiceChargeMethod.reducingBalance,
          icon: Icon(Icons.timeline_outlined),
          label: Text('Reducing'),
        ),
        ButtonSegment(
          value: PtptnServiceChargeMethod.flatRate,
          icon: Icon(Icons.horizontal_rule_outlined),
          label: Text('Flat'),
        ),
      ],
      selected: {selected},
      onSelectionChanged: (selection) {
        onChanged(selection.first);
      },
    );
  }
}

class BuyerTypeSelector extends StatelessWidget {
  const BuyerTypeSelector({
    super.key,
    required this.selected,
    required this.onChanged,
  });

  final MalaysiaBuyerType selected;
  final ValueChanged<MalaysiaBuyerType> onChanged;

  @override
  Widget build(BuildContext context) {
    return SegmentedButton<MalaysiaBuyerType>(
      showSelectedIcon: false,
      segments: const [
        ButtonSegment(
          value: MalaysiaBuyerType.citizen,
          icon: Icon(Icons.person_outline),
          label: Text('Citizen'),
        ),
        ButtonSegment(
          value: MalaysiaBuyerType.permanentResident,
          icon: Icon(Icons.badge_outlined),
          label: Text('PR'),
        ),
        ButtonSegment(
          value: MalaysiaBuyerType.foreignIndividual,
          icon: Icon(Icons.public_outlined),
          label: Text('Foreign'),
        ),
      ],
      selected: {selected},
      onSelectionChanged: (selection) {
        onChanged(selection.first);
      },
    );
  }
}

class ResultSummary extends StatelessWidget {
  const ResultSummary({super.key, required this.result});

  final HomeLoanResult result;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final statutoryCosts = result.upfrontCosts.totalForCategory(
      UpfrontCostCategory.statutory,
    );
    final professionalCosts = result.upfrontCosts.totalForCategory(
      UpfrontCostCategory.professional,
    );
    final financingLabel = result.financingType == HomeFinancingType.islamic
        ? 'profit-rate equivalent'
        : 'interest estimate';
    final upfrontRatio = result.propertyPrice == 0
        ? 0.0
        : result.upfrontCosts.total / result.propertyPrice * 100;

    return DecoratedBox(
      decoration: BoxDecoration(
        color: colorScheme.primaryContainer,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Estimated monthly installment',
              style: Theme.of(context).textTheme.labelLarge?.copyWith(
                color: colorScheme.onPrimaryContainer,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              formatMyr(result.monthlyInstallment),
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                color: colorScheme.onPrimaryContainer,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Loan amount ${formatMyr(result.loanAmount)} after ${formatMyr(result.downPaymentAmount)} down payment.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: colorScheme.onPrimaryContainer,
              ),
            ),
            const SizedBox(height: 14),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                ResultMetric(
                  label: 'Upfront cash',
                  value: formatMyr(result.upfrontCosts.total),
                ),
                ResultMetric(
                  label: 'Professional fees',
                  value: formatMyr(professionalCosts),
                ),
                ResultMetric(
                  label: 'Stamp duty',
                  value: formatMyr(statutoryCosts),
                ),
                ResultMetric(
                  label: result.financingType == HomeFinancingType.islamic
                      ? 'Total profit est.'
                      : 'Total interest',
                  value: formatMyr(result.totalInterest),
                ),
                ResultMetric(
                  label: 'Total repayment',
                  value: formatMyr(result.totalRepayment),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ResultNote(
              icon: Icons.savings_outlined,
              text:
                  'Upfront cash is about ${formatPercent(upfrontRatio)} of the property price.',
            ),
            if (result.stampDuty.firstHomeExemptionApplied) ...[
              const SizedBox(height: 8),
              ResultNote(
                icon: Icons.verified_user_outlined,
                text:
                    'First-home exemption estimated: ${formatMyr(result.stampDuty.totalExemption)}.',
              ),
            ],
            const SizedBox(height: 8),
            ResultNote(
              icon: Icons.edit_note_outlined,
              text:
                  'Replace professional fees and $financingLabel with actual bank, lawyer, and valuer quotes when available.',
            ),
          ],
        ),
      ),
    );
  }
}

class ResultNote extends StatelessWidget {
  const ResultNote({super.key, required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: colorScheme.onPrimaryContainer),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: colorScheme.onPrimaryContainer,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}

class ResultMetric extends StatelessWidget {
  const ResultMetric({super.key, required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return ConstrainedBox(
      constraints: const BoxConstraints(minWidth: 132),
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: colorScheme.surface.withValues(alpha: 0.75),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                label,
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class AffordabilityGuidancePanel extends StatelessWidget {
  const AffordabilityGuidancePanel({super.key, required this.result});

  final AffordabilityResult result;

  @override
  Widget build(BuildContext context) {
    return SectionPanel(
      title: 'Affordability guidance',
      icon: Icons.speed_outlined,
      children: [
        GuidanceBadge(status: result.status),
        const SizedBox(height: 12),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: [
            ResultMetric(
              label: 'Current DSR',
              value: formatPercent(result.currentDsrPercent),
            ),
            ResultMetric(
              label: 'Target installment',
              value: formatMyr(result.maximumTargetInstallment),
            ),
            ResultMetric(
              label: 'Room remaining',
              value: formatMyr(result.remainingTargetRoom),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Text(
          'Tenure comparison',
          style: Theme.of(
            context,
          ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 6),
        for (final option in result.tenureOptions)
          AffordabilityTenureRow(option: option),
        const SizedBox(height: 6),
        Text(
          'This is guidance only. Banks may assess income, commitments, credit history, property type, and internal policy differently.',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}

class AffordabilityTenureRow extends StatelessWidget {
  const AffordabilityTenureRow({super.key, required this.option});

  final AffordabilityTenureOption option;

  @override
  Widget build(BuildContext context) {
    final style = Theme.of(context).textTheme.bodyMedium;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          SizedBox(
            width: 58,
            child: Text('${option.tenureYears} yrs', style: style),
          ),
          Expanded(
            child: Text(
              formatMyr(option.monthlyInstallment),
              style: style?.copyWith(fontWeight: FontWeight.w700),
            ),
          ),
          Text(formatPercent(option.dsrPercent), style: style),
          const SizedBox(width: 8),
          MiniStatusDot(status: option.status),
        ],
      ),
    );
  }
}

class GuidanceBadge extends StatelessWidget {
  const GuidanceBadge({super.key, required this.status});

  final AffordabilityStatus status;

  @override
  Widget build(BuildContext context) {
    final colors = _statusColors(status);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: colors.background,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: colors.foreground.withValues(alpha: 0.35)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(_statusIcon(status), color: colors.foreground),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                _statusMessage(status),
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: colors.foreground,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class MiniStatusDot extends StatelessWidget {
  const MiniStatusDot({super.key, required this.status});

  final AffordabilityStatus status;

  @override
  Widget build(BuildContext context) {
    final colors = _statusColors(status);

    return Tooltip(
      message: _statusLabel(status),
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: colors.background,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: colors.foreground.withValues(alpha: 0.4)),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          child: Text(
            _statusLabel(status),
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: colors.foreground,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
      ),
    );
  }
}

({Color background, Color foreground}) _statusColors(
  AffordabilityStatus status,
) {
  return switch (status) {
    AffordabilityStatus.withinTarget => (
      background: const Color(0xFFE6F4EA),
      foreground: const Color(0xFF1E6B38),
    ),
    AffordabilityStatus.nearTarget => (
      background: const Color(0xFFFFF7E2),
      foreground: const Color(0xFF7A5B00),
    ),
    AffordabilityStatus.aboveTarget => (
      background: const Color(0xFFFCE8E6),
      foreground: const Color(0xFF9B1C13),
    ),
    AffordabilityStatus.unavailable => (
      background: const Color(0xFFECEFF1),
      foreground: const Color(0xFF455A64),
    ),
  };
}

IconData _statusIcon(AffordabilityStatus status) {
  return switch (status) {
    AffordabilityStatus.withinTarget => Icons.check_circle_outline,
    AffordabilityStatus.nearTarget => Icons.warning_amber_outlined,
    AffordabilityStatus.aboveTarget => Icons.priority_high_outlined,
    AffordabilityStatus.unavailable => Icons.help_outline,
  };
}

String _statusLabel(AffordabilityStatus status) {
  return switch (status) {
    AffordabilityStatus.withinTarget => 'Within',
    AffordabilityStatus.nearTarget => 'Review',
    AffordabilityStatus.aboveTarget => 'High',
    AffordabilityStatus.unavailable => 'N/A',
  };
}

String _statusMessage(AffordabilityStatus status) {
  return switch (status) {
    AffordabilityStatus.withinTarget =>
      'This estimate is within the selected DSR target.',
    AffordabilityStatus.nearTarget =>
      'This estimate is close to or above the selected DSR target. Review commitments and buffer.',
    AffordabilityStatus.aboveTarget =>
      'This estimate is well above the selected DSR target. Consider lower price, bigger down payment, or longer tenure.',
    AffordabilityStatus.unavailable =>
      'Affordability guidance is unavailable for these inputs.',
  };
}

class CostBreakdown extends StatelessWidget {
  const CostBreakdown({super.key, required this.result});

  final HomeLoanResult result;

  @override
  Widget build(BuildContext context) {
    final cashBeforeLoan = result.upfrontCosts.totalForCategory(
      UpfrontCostCategory.cashBeforeLoan,
    );
    final statutoryCosts = result.upfrontCosts.totalForCategory(
      UpfrontCostCategory.statutory,
    );
    final professionalCosts = result.upfrontCosts.totalForCategory(
      UpfrontCostCategory.professional,
    );

    return SectionPanel(
      title: 'Upfront cost breakdown',
      icon: Icons.receipt_long_outlined,
      children: [
        AmountRow(label: 'Cash before loan', amount: cashBeforeLoan),
        AmountRow(label: 'Statutory costs', amount: statutoryCosts),
        AmountRow(label: 'Professional fees', amount: professionalCosts),
        const Divider(height: 20),
        for (final item in result.upfrontCosts.items)
          AmountRow(label: item.label, amount: item.amount),
        const Divider(height: 20),
        AmountRow(
          label: 'Total upfront cash',
          amount: result.upfrontCosts.total,
          isStrong: true,
        ),
      ],
    );
  }
}

class AmortizationPreview extends StatelessWidget {
  const AmortizationPreview({super.key, required this.result});

  final HomeLoanResult result;

  @override
  Widget build(BuildContext context) {
    return SectionPanel(
      title: 'Full amortization preview',
      icon: Icons.table_chart_outlined,
      children: [
        for (final year in result.yearlyAmortization)
          AmountRow(
            label: 'Year ${year.year} balance',
            amount: year.endingBalance,
          ),
      ],
    );
  }
}

class SectionPanel extends StatelessWidget {
  const SectionPanel({
    super.key,
    required this.title,
    required this.icon,
    required this.children,
    this.infoTitle,
    this.infoMessage,
  });

  final String title;
  final IconData icon;
  final List<Widget> children;
  final String? infoTitle;
  final String? infoMessage;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: theme.colorScheme.outlineVariant),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    title,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                if (infoMessage != null)
                  IconButton(
                    tooltip: infoTitle ?? 'More info',
                    onPressed: () {
                      showInfoDialog(
                        context,
                        title: infoTitle ?? title,
                        message: infoMessage!,
                      );
                    },
                    icon: const Icon(Icons.info_outline),
                  ),
              ],
            ),
            const SizedBox(height: 10),
            ...children,
          ],
        ),
      ),
    );
  }
}

class AmountRow extends StatelessWidget {
  const AmountRow({
    super.key,
    required this.label,
    required this.amount,
    this.isStrong = false,
  });

  final String label;
  final double amount;
  final bool isStrong;

  @override
  Widget build(BuildContext context) {
    final style = Theme.of(context).textTheme.bodyMedium?.copyWith(
      fontWeight: isStrong ? FontWeight.w800 : FontWeight.w500,
    );

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        children: [
          Expanded(child: Text(label, style: style)),
          const SizedBox(width: 12),
          Flexible(
            child: Text(
              formatMyr(amount),
              textAlign: TextAlign.end,
              style: style,
            ),
          ),
        ],
      ),
    );
  }
}

class ErrorMessage extends StatelessWidget {
  const ErrorMessage({super.key, required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return DecoratedBox(
      decoration: BoxDecoration(
        color: colorScheme.errorContainer,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Icon(Icons.error_outline, color: colorScheme.onErrorContainer),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: TextStyle(color: colorScheme.onErrorContainer),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class SaveScenarioDialog extends StatefulWidget {
  const SaveScenarioDialog({super.key, required this.initialName});

  final String initialName;

  @override
  State<SaveScenarioDialog> createState() => _SaveScenarioDialogState();
}

class _SaveScenarioDialogState extends State<SaveScenarioDialog> {
  late final TextEditingController _nameController;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.initialName);
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Save scenario'),
      content: TextField(
        controller: _nameController,
        autofocus: true,
        maxLength: 40,
        decoration: const InputDecoration(
          labelText: 'Scenario name',
          prefixIcon: Icon(Icons.drive_file_rename_outline),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        FilledButton.icon(
          onPressed: () {
            Navigator.of(context).pop(_nameController.text);
          },
          icon: const Icon(Icons.bookmark_add_outlined),
          label: const Text('Save'),
        ),
      ],
    );
  }
}

class SavedScenarioEntry {
  const SavedScenarioEntry.home(this.homeScenario) : consumerScenario = null;

  const SavedScenarioEntry.consumer(this.consumerScenario)
    : homeScenario = null;

  final HomeLoanScenario? homeScenario;
  final ConsumerLoanScenario? consumerScenario;

  String get id => homeScenario?.id ?? consumerScenario!.id;

  String get name => homeScenario?.name ?? consumerScenario!.name;

  DateTime get createdAt =>
      homeScenario?.createdAt ?? consumerScenario!.createdAt;

  SavedScenarioType get type => homeScenario == null
      ? consumerScenario!.type
      : SavedScenarioType.homeLoan;

  bool get isHomeLoan => homeScenario != null;

  IconData get icon {
    return switch (type) {
      SavedScenarioType.homeLoan => Icons.home_work_outlined,
      SavedScenarioType.carLoan => Icons.directions_car_outlined,
      SavedScenarioType.personalLoan => Icons.account_balance_wallet_outlined,
      SavedScenarioType.creditCard => Icons.credit_card_outlined,
      SavedScenarioType.ptptnLoan => Icons.school_outlined,
    };
  }

  List<({String label, String value})> get metrics {
    if (homeScenario case final scenario?) {
      return [
        (label: 'Property', value: formatMyr(scenario.propertyPrice)),
        (label: 'Monthly', value: formatMyr(scenario.monthlyInstallment)),
        (label: 'Upfront', value: formatMyr(scenario.upfrontCash)),
      ];
    }

    final scenario = consumerScenario!;
    return switch (scenario.type) {
      SavedScenarioType.carLoan => [
        (label: 'Vehicle', value: formatMyr(scenario.amount)),
        (label: 'Monthly', value: formatMyr(scenario.resultMonthlyPayment)),
        (label: 'Interest', value: formatMyr(scenario.totalInterest)),
      ],
      SavedScenarioType.personalLoan => [
        (label: 'Loan', value: formatMyr(scenario.amount)),
        (label: 'Monthly', value: formatMyr(scenario.resultMonthlyPayment)),
        (
          label: 'Cost',
          value: formatMyr(scenario.totalInterest + scenario.upfrontFees),
        ),
      ],
      SavedScenarioType.creditCard => [
        (label: 'Balance', value: formatMyr(scenario.amount)),
        (
          label: 'Payoff',
          value: scenario.isPaidOff
              ? formatMonthsDuration(scenario.payoffMonths)
              : 'Review',
        ),
        (label: 'Interest', value: formatMyr(scenario.totalInterest)),
      ],
      SavedScenarioType.ptptnLoan => [
        (label: 'Balance', value: formatMyr(scenario.amount)),
        (label: 'Monthly', value: formatMyr(scenario.resultMonthlyPayment)),
        (label: 'Payoff', value: formatMonthsDuration(scenario.payoffMonths)),
      ],
      SavedScenarioType.homeLoan => const [],
    };
  }
}

class SavedProfileSummaryCard extends StatelessWidget {
  const SavedProfileSummaryCard({super.key, required this.onOpen});

  final VoidCallback onOpen;

  Future<PersonalFinanceProfile?> _loadProfile() {
    return PersonalFinanceProfileRepository().load();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return FutureBuilder<PersonalFinanceProfile?>(
      future: _loadProfile(),
      builder: (context, snapshot) {
        final profile = snapshot.data;
        final result = profile == null
            ? null
            : const SalaryPlannerCalculator().calculate(
                SalaryPlannerInput(
                  grossMonthlySalary: profile.grossMonthlySalary,
                  epfEmployeeRatePercent: profile.epfEmployeeRatePercent,
                  socsoEmployeeRatePercent: profile.socsoEmployeeRatePercent,
                  eisEmployeeRatePercent: profile.eisEmployeeRatePercent,
                  socialSecurityWageCeiling: profile.socialSecurityWageCeiling,
                  monthlyPcbTax: profile.monthlyPcbTax,
                  existingMonthlyCommitments:
                      profile.existingMonthlyCommitments,
                  monthlyLivingExpenses: profile.monthlyLivingExpenses,
                  targetSavingsPercent: profile.targetSavingsPercent,
                  targetDsrPercent: profile.targetDsrPercent,
                  loanInstallmentToEvaluate: 0,
                ),
              );

        return DecoratedBox(
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: _profileAccent.withValues(alpha: 0.35)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: _profileAccent.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.person_outline,
                        color: _profileAccent,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Saved profile',
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            profile == null
                                ? 'No profile saved yet'
                                : 'Saved locally on this device',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                if (profile == null)
                  Text(
                    'Create this once so calculators and Overall Loans can evaluate decisions against your salary and monthly cashflow.',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  )
                else
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      ResultMetric(
                        label: 'Gross salary',
                        value: formatMyr(profile.grossMonthlySalary),
                      ),
                      ResultMetric(
                        label: 'Take-home',
                        value: formatMyr(result!.netMonthlyIncome),
                      ),
                      ResultMetric(
                        label: 'Target DSR',
                        value: formatPercent(profile.targetDsrPercent),
                      ),
                    ],
                  ),
                const SizedBox(height: 12),
                Align(
                  alignment: Alignment.centerRight,
                  child: FilledButton.icon(
                    onPressed: onOpen,
                    icon: const Icon(Icons.open_in_new_outlined),
                    label: Text(
                      profile == null ? 'Create profile' : 'Open profile',
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class SavedScenariosScreen extends StatefulWidget {
  const SavedScenariosScreen({
    super.key,
    this.selectionMode = false,
    this.filterType,
  });

  final bool selectionMode;
  final SavedScenarioType? filterType;

  @override
  State<SavedScenariosScreen> createState() => _SavedScenariosScreenState();
}

class _SavedScenariosScreenState extends State<SavedScenariosScreen> {
  final _homeRepository = SavedScenarioRepository();
  final _consumerRepository = ConsumerScenarioRepository();
  final _ongoingLoanRepository = OngoingLoanRepository();
  late Future<List<SavedScenarioEntry>> _scenariosFuture;

  @override
  void initState() {
    super.initState();
    _scenariosFuture = _loadEntries();
  }

  Future<List<SavedScenarioEntry>> _loadEntries() async {
    final entries = <SavedScenarioEntry>[];
    final filterType = widget.filterType;

    if (filterType == null || filterType == SavedScenarioType.homeLoan) {
      final homeScenarios = await _homeRepository.loadAll();
      entries.addAll(homeScenarios.map(SavedScenarioEntry.home));
    }

    if (filterType == null || filterType != SavedScenarioType.homeLoan) {
      final consumerScenarios = await _consumerRepository.loadAll(
        type: filterType == SavedScenarioType.homeLoan ? null : filterType,
      );
      entries.addAll(consumerScenarios.map(SavedScenarioEntry.consumer));
    }

    entries.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return entries;
  }

  void _reload() {
    setState(() {
      _scenariosFuture = _loadEntries();
    });
  }

  Future<void> _openProfile() async {
    await Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => const PersonalProfileScreen()),
    );
    if (!mounted) {
      return;
    }
    _reload();
  }

  Future<void> _deleteScenario(SavedScenarioEntry entry) async {
    final shouldDelete = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete scenario?'),
        content: Text('"${entry.name}" will be removed from this device only.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton.icon(
            onPressed: () => Navigator.of(context).pop(true),
            icon: const Icon(Icons.delete_outline),
            label: const Text('Delete'),
          ),
        ],
      ),
    );

    if (shouldDelete != true) {
      return;
    }

    if (entry.homeScenario case final scenario?) {
      await _homeRepository.delete(scenario.id);
    } else {
      await _consumerRepository.delete(entry.consumerScenario!.id);
    }

    if (!mounted) {
      return;
    }
    _reload();
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text('Deleted "${entry.name}".')));
  }

  void _openScenario(SavedScenarioEntry entry) {
    if (widget.selectionMode) {
      Navigator.of(context).pop(entry.homeScenario ?? entry.consumerScenario);
      return;
    }

    final route = switch (entry.type) {
      SavedScenarioType.homeLoan => MaterialPageRoute<void>(
        builder: (_) => HomeLoanScreen(initialScenario: entry.homeScenario),
      ),
      SavedScenarioType.carLoan => MaterialPageRoute<void>(
        builder: (_) => CarLoanScreen(initialScenario: entry.consumerScenario),
      ),
      SavedScenarioType.personalLoan => MaterialPageRoute<void>(
        builder: (_) =>
            PersonalLoanScreen(initialScenario: entry.consumerScenario),
      ),
      SavedScenarioType.creditCard => MaterialPageRoute<void>(
        builder: (_) =>
            CreditCardScreen(initialScenario: entry.consumerScenario),
      ),
      SavedScenarioType.ptptnLoan => MaterialPageRoute<void>(
        builder: (_) =>
            PtptnLoanScreen(initialScenario: entry.consumerScenario),
      ),
    };

    Navigator.of(context).push(route);
  }

  Future<void> _addToOngoingLoans(SavedScenarioEntry entry) async {
    final now = DateTime.now();
    final loan = _ongoingLoanFromScenario(entry, now);
    await _ongoingLoanRepository.save(loan);

    if (!mounted) {
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Added "${entry.name}" to Overall Loans.')),
    );
  }

  OngoingLoanCommitment _ongoingLoanFromScenario(
    SavedScenarioEntry entry,
    DateTime now,
  ) {
    if (entry.homeScenario case final scenario?) {
      return OngoingLoanCommitment(
        id: 'scenario-${entry.id}',
        name: scenario.name,
        type: OngoingLoanType.home,
        monthlyPayment: scenario.monthlyInstallment,
        remainingBalance: scenario.loanAmount,
        annualRatePercent: scenario.annualInterestRatePercent,
        createdAt: now,
      );
    }

    final scenario = entry.consumerScenario!;
    final type = switch (scenario.type) {
      SavedScenarioType.carLoan => OngoingLoanType.car,
      SavedScenarioType.personalLoan => OngoingLoanType.personal,
      SavedScenarioType.creditCard => OngoingLoanType.creditCard,
      SavedScenarioType.ptptnLoan => OngoingLoanType.ptptn,
      SavedScenarioType.homeLoan => OngoingLoanType.other,
    };
    final remainingBalance = switch (scenario.type) {
      SavedScenarioType.carLoan =>
        scenario.amount * (1 - scenario.downPaymentPercent / 100),
      SavedScenarioType.creditCard =>
        scenario.remainingBalance == 0
            ? scenario.amount
            : scenario.remainingBalance,
      _ => scenario.amount,
    };

    return OngoingLoanCommitment(
      id: 'scenario-${entry.id}',
      name: scenario.name,
      type: type,
      monthlyPayment: scenario.resultMonthlyPayment,
      remainingBalance: remainingBalance,
      annualRatePercent: scenario.annualRatePercent,
      createdAt: now,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final title = widget.filterType?.label ?? 'Saved Scenarios';

    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: SafeArea(
        child: FutureBuilder<List<SavedScenarioEntry>>(
          future: _scenariosFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState != ConnectionState.done) {
              return const Center(child: CircularProgressIndicator());
            }

            final scenarios = snapshot.data ?? const [];
            final showProfileCard =
                widget.filterType == null && !widget.selectionMode;

            if (scenarios.isEmpty) {
              return ListView(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                children: [
                  if (showProfileCard) ...[
                    SavedProfileSummaryCard(onOpen: _openProfile),
                    const SizedBox(height: 14),
                  ],
                  Text(
                    'No saved loan scenarios yet',
                    style: theme.textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    widget.filterType == null
                        ? 'Calculate any loan, then save it here for quick comparison later.'
                        : 'Calculate and save a ${widget.filterType!.label.toLowerCase()} scenario for quick access later.',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              );
            }

            return ListView.separated(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              itemBuilder: (context, index) {
                if (showProfileCard && index == 0) {
                  return SavedProfileSummaryCard(onOpen: _openProfile);
                }

                final scenario = scenarios[index - (showProfileCard ? 1 : 0)];
                return SavedScenarioCard(
                  entry: scenario,
                  actionLabel: widget.selectionMode ? 'Use' : 'Open',
                  onOpen: () => _openScenario(scenario),
                  onDelete: () => _deleteScenario(scenario),
                  onAddToOngoing: widget.selectionMode
                      ? null
                      : () => _addToOngoingLoans(scenario),
                );
              },
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemCount: scenarios.length + (showProfileCard ? 1 : 0),
            );
          },
        ),
      ),
    );
  }
}

class SavedScenarioCard extends StatelessWidget {
  const SavedScenarioCard({
    super.key,
    required this.entry,
    required this.actionLabel,
    required this.onOpen,
    required this.onDelete,
    this.onAddToOngoing,
  });

  final SavedScenarioEntry entry;
  final String actionLabel;
  final VoidCallback onOpen;
  final VoidCallback onDelete;
  final VoidCallback? onAddToOngoing;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final accent = savedScenarioAccent(entry.type);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: accent.withValues(alpha: 0.35)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: accent.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(entry.icon, color: accent),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        entry.name,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${entry.type.label} - Saved ${formatDate(entry.createdAt)}',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  tooltip: 'Delete',
                  onPressed: onDelete,
                  icon: const Icon(Icons.delete_outline),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final metric in entry.metrics)
                  ResultMetric(label: metric.label, value: metric.value),
              ],
            ),
            const SizedBox(height: 12),
            Wrap(
              alignment: WrapAlignment.end,
              spacing: 8,
              runSpacing: 8,
              children: [
                if (onAddToOngoing != null)
                  OutlinedButton.icon(
                    onPressed: onAddToOngoing,
                    icon: const Icon(Icons.playlist_add_outlined),
                    label: const Text('Add to Overall Loans'),
                  ),
                FilledButton.icon(
                  onPressed: onOpen,
                  icon: const Icon(Icons.open_in_new_outlined),
                  label: Text(actionLabel),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class InputPlanTile extends StatelessWidget {
  const InputPlanTile({
    super.key,
    required this.icon,
    required this.title,
    required this.subtitle,
    this.onTap,
    this.trailing,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback? onTap;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        onTap: onTap,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: BorderSide(color: theme.colorScheme.outlineVariant),
        ),
        tileColor: theme.colorScheme.surface,
        leading: Icon(icon),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
        subtitle: Text(subtitle),
        trailing: trailing,
      ),
    );
  }
}

class LanguageScreen extends StatefulWidget {
  const LanguageScreen({super.key});

  @override
  State<LanguageScreen> createState() => _LanguageScreenState();
}

class _LanguageScreenState extends State<LanguageScreen> {
  final _preferences = AppPreferenceRepository();
  late Future<AppLanguage> _languageFuture;

  @override
  void initState() {
    super.initState();
    _languageFuture = _preferences.loadLanguage();
  }

  Future<void> _selectLanguage(AppLanguage language) async {
    await _preferences.saveLanguage(language);
    if (!mounted) {
      return;
    }

    setState(() {
      _languageFuture = Future.value(language);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('${language.label} preference saved.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Language')),
      body: SafeArea(
        child: FutureBuilder<AppLanguage>(
          future: _languageFuture,
          builder: (context, snapshot) {
            final selected = snapshot.data ?? AppLanguage.english;

            return ListView(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              children: [
                Text(
                  'Display language',
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'English is active for v1. BM, Chinese, and Tamil preferences are saved now so translated labels can be turned on cleanly later.',
                  style: theme.textTheme.bodyLarge?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 18),
                SegmentedButton<AppLanguage>(
                  showSelectedIcon: false,
                  segments: [
                    for (final language in AppLanguage.values)
                      ButtonSegment(
                        value: language,
                        icon: const Icon(Icons.translate_outlined),
                        label: Text(language.shortLabel),
                      ),
                  ],
                  selected: {selected},
                  onSelectionChanged: (selection) {
                    _selectLanguage(selection.first);
                  },
                ),
                const SizedBox(height: 16),
                SectionPanel(
                  title: 'Language rollout',
                  icon: Icons.language_outlined,
                  infoTitle: 'Why English first?',
                  infoMessage:
                      'Loan, tax, legal, and privacy wording should be translated carefully. The selector is ready, but full BM, Chinese, and Tamil copies should be reviewed before release.',
                  children: [
                    for (final language in AppLanguage.values)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.translate_outlined, size: 20),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    language.label,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(language.description),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class AccountSyncScreen extends StatefulWidget {
  const AccountSyncScreen({super.key});

  @override
  State<AccountSyncScreen> createState() => _AccountSyncScreenState();
}

class _AccountSyncScreenState extends State<AccountSyncScreen> {
  final _authRepository = const SpectraAuthRepository();
  final _syncRepository = SpectraCloudSyncRepository();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  late SpectraAccountSession _session;
  bool _isBusy = false;
  bool _isCreatingAccount = false;
  String? _statusMessage;

  @override
  void initState() {
    super.initState();
    _session = _authRepository.currentSession();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _continueLocalOnly() async {
    await AppPreferenceRepository().saveAccountPromptDismissed(true);
    if (!mounted) {
      return;
    }

    _showSnackBar('Local-only mode saved for now.');
  }

  Future<void> _submitAuth() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || password.length < 6) {
      _showSnackBar(
        'Enter an email and a password with at least 6 characters.',
      );
      return;
    }

    await _runBusy(() async {
      if (_isCreatingAccount) {
        await _authRepository.signUp(email: email, password: password);
        _statusMessage =
            'Account created. Check your email if Supabase requires confirmation.';
      } else {
        await _authRepository.signIn(email: email, password: password);
        _statusMessage = 'Signed in to Spectra cloud sync.';
      }
      await AppPreferenceRepository().saveAccountPromptDismissed(true);
      _refreshSession();
    });
  }

  Future<void> _sendPasswordReset() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      _showSnackBar('Enter your email first.');
      return;
    }

    await _runBusy(() async {
      await _authRepository.sendPasswordReset(email);
      _statusMessage = 'Password reset email sent.';
    });
  }

  Future<void> _signOut() async {
    await _runBusy(() async {
      await _authRepository.signOut();
      _statusMessage = 'Signed out. Local data remains on this device.';
      _refreshSession();
    });
  }

  Future<void> _pushLocalData() async {
    await _runBusy(() async {
      final summary = await _syncRepository.pushLocalDataToCloud();
      _statusMessage =
          'Backed up ${summary.totalItems} item${summary.totalItems == 1 ? '' : 's'} to Supabase.';
    });
  }

  Future<void> _pullCloudData() async {
    await _runBusy(() async {
      final summary = await _syncRepository.pullCloudDataToLocal();
      _statusMessage =
          'Downloaded ${summary.totalItems} item${summary.totalItems == 1 ? '' : 's'} to this device.';
    });
  }

  Future<void> _deleteCloudData() async {
    final shouldDelete = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete cloud data?'),
        content: const Text(
          'This removes your Spectra cloud profile, saved scenarios, ongoing loans, settings, and sync logs from Supabase. Local data on this device is not deleted.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton.icon(
            onPressed: () => Navigator.of(context).pop(true),
            icon: const Icon(Icons.delete_forever_outlined),
            label: const Text('Delete cloud data'),
          ),
        ],
      ),
    );

    if (shouldDelete != true) {
      return;
    }

    await _runBusy(() async {
      await _syncRepository.deleteCloudData();
      _statusMessage = 'Cloud data deleted from Supabase.';
    });
  }

  Future<void> _runBusy(Future<void> Function() action) async {
    if (_isBusy) {
      return;
    }

    setState(() {
      _isBusy = true;
      _statusMessage = null;
    });

    try {
      await action();
    } on Object catch (error) {
      _statusMessage = error.toString();
    } finally {
      if (mounted) {
        setState(() {
          _isBusy = false;
          _session = _authRepository.currentSession();
        });
      }
    }
  }

  void _refreshSession() {
    if (!mounted) {
      return;
    }

    setState(() {
      _session = _authRepository.currentSession();
    });
  }

  void _showSnackBar(String message) {
    if (!mounted) {
      return;
    }

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Account & Sync')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          children: [
            Text(
              'Spectra cloud sync',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Keep using the calculator locally, or sign in to back up your profile, scenarios, and ongoing loans with Supabase.',
              style: theme.textTheme.bodyLarge?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 18),
            if (!_session.isConfigured)
              _SupabaseNotConfiguredPanel()
            else if (_session.isSignedIn)
              _SignedInSyncPanel(
                email: _session.email,
                userId: _session.userId,
                isBusy: _isBusy,
                onPushLocalData: _pushLocalData,
                onPullCloudData: _pullCloudData,
                onDeleteCloudData: _deleteCloudData,
                onSignOut: _signOut,
              )
            else
              _AuthPanel(
                emailController: _emailController,
                passwordController: _passwordController,
                isBusy: _isBusy,
                isCreatingAccount: _isCreatingAccount,
                onModeChanged: (value) {
                  setState(() {
                    _isCreatingAccount = value;
                  });
                },
                onSubmit: _submitAuth,
                onPasswordReset: _sendPasswordReset,
              ),
            if (_statusMessage != null) ...[
              const SizedBox(height: 12),
              SyncStatusBanner(message: _statusMessage!),
            ],
            const SizedBox(height: 12),
            SectionPanel(
              title: 'Your control',
              icon: Icons.verified_user_outlined,
              children: [
                const BulletText(
                  text:
                      'Cloud sync is optional. Local-only mode remains available.',
                ),
                const BulletText(
                  text:
                      'Salary and loan values are uploaded only after sign-in and sync.',
                ),
                const BulletText(
                  text:
                      'Do not enter NRIC, card numbers, bank account numbers, OTPs, or official loan documents.',
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: _isBusy ? null : _continueLocalOnly,
                  icon: const Icon(Icons.phone_android_outlined),
                  label: const Text('Use local-only for now'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _SupabaseNotConfiguredPanel extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return const SectionPanel(
      title: 'Supabase setup needed',
      icon: Icons.cloud_off_outlined,
      children: [
        Text(
          'This build does not include a Supabase publishable key yet. Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY during the Flutter web build or in Cloudflare Pages build settings.',
        ),
        SizedBox(height: 12),
        SelectableText(
          'flutter build web --release --base-href / --dart-define=SUPABASE_URL=https://gmluepisjslxowncdxba.supabase.co --dart-define=SUPABASE_PUBLISHABLE_KEY=your-publishable-key',
        ),
      ],
    );
  }
}

class _AuthPanel extends StatelessWidget {
  const _AuthPanel({
    required this.emailController,
    required this.passwordController,
    required this.isBusy,
    required this.isCreatingAccount,
    required this.onModeChanged,
    required this.onSubmit,
    required this.onPasswordReset,
  });

  final TextEditingController emailController;
  final TextEditingController passwordController;
  final bool isBusy;
  final bool isCreatingAccount;
  final ValueChanged<bool> onModeChanged;
  final VoidCallback onSubmit;
  final VoidCallback onPasswordReset;

  @override
  Widget build(BuildContext context) {
    return SectionPanel(
      title: 'Sign in',
      icon: Icons.login_outlined,
      children: [
        SegmentedButton<bool>(
          showSelectedIcon: false,
          segments: const [
            ButtonSegment(
              value: false,
              icon: Icon(Icons.login_outlined),
              label: Text('Sign in'),
            ),
            ButtonSegment(
              value: true,
              icon: Icon(Icons.person_add_alt_outlined),
              label: Text('Create'),
            ),
          ],
          selected: {isCreatingAccount},
          onSelectionChanged: isBusy
              ? null
              : (selection) => onModeChanged(selection.first),
        ),
        const SizedBox(height: 14),
        TextField(
          controller: emailController,
          enabled: !isBusy,
          keyboardType: TextInputType.emailAddress,
          autofillHints: const [AutofillHints.email],
          decoration: const InputDecoration(
            labelText: 'Email',
            border: OutlineInputBorder(),
            prefixIcon: Icon(Icons.mail_outline),
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: passwordController,
          enabled: !isBusy,
          obscureText: true,
          autofillHints: const [AutofillHints.password],
          decoration: const InputDecoration(
            labelText: 'Password',
            border: OutlineInputBorder(),
            prefixIcon: Icon(Icons.lock_outline),
          ),
        ),
        const SizedBox(height: 14),
        FilledButton.icon(
          onPressed: isBusy ? null : onSubmit,
          icon: Icon(
            isCreatingAccount
                ? Icons.person_add_alt_outlined
                : Icons.login_outlined,
          ),
          label: Text(isCreatingAccount ? 'Create account' : 'Sign in'),
        ),
        const SizedBox(height: 8),
        TextButton.icon(
          onPressed: isBusy ? null : onPasswordReset,
          icon: const Icon(Icons.key_outlined),
          label: const Text('Send password reset email'),
        ),
      ],
    );
  }
}

class _SignedInSyncPanel extends StatelessWidget {
  const _SignedInSyncPanel({
    required this.email,
    required this.userId,
    required this.isBusy,
    required this.onPushLocalData,
    required this.onPullCloudData,
    required this.onDeleteCloudData,
    required this.onSignOut,
  });

  final String? email;
  final String? userId;
  final bool isBusy;
  final VoidCallback onPushLocalData;
  final VoidCallback onPullCloudData;
  final VoidCallback onDeleteCloudData;
  final VoidCallback onSignOut;

  @override
  Widget build(BuildContext context) {
    return SectionPanel(
      title: 'Signed in',
      icon: Icons.cloud_done_outlined,
      children: [
        ListTile(
          contentPadding: EdgeInsets.zero,
          leading: const Icon(Icons.account_circle_outlined),
          title: Text(email ?? 'Spectra account'),
          subtitle: Text(userId ?? 'Supabase user'),
        ),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            FilledButton.icon(
              onPressed: isBusy ? null : onPushLocalData,
              icon: const Icon(Icons.cloud_upload_outlined),
              label: const Text('Back up this device'),
            ),
            OutlinedButton.icon(
              onPressed: isBusy ? null : onPullCloudData,
              icon: const Icon(Icons.cloud_download_outlined),
              label: const Text('Download cloud data'),
            ),
            OutlinedButton.icon(
              onPressed: isBusy ? null : onSignOut,
              icon: const Icon(Icons.logout_outlined),
              label: const Text('Sign out'),
            ),
            TextButton.icon(
              onPressed: isBusy ? null : onDeleteCloudData,
              icon: const Icon(Icons.delete_forever_outlined),
              label: const Text('Delete cloud data'),
            ),
          ],
        ),
      ],
    );
  }
}

class SyncStatusBanner extends StatelessWidget {
  const SyncStatusBanner({super.key, required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: theme.colorScheme.primaryContainer.withValues(alpha: 0.55),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: theme.colorScheme.primary.withValues(alpha: 0.2),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.info_outline, color: theme.colorScheme.primary),
          const SizedBox(width: 10),
          Expanded(child: Text(message)),
        ],
      ),
    );
  }
}

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          children: [
            Text(
              'App controls',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 16),
            InputPlanTile(
              icon: Icons.account_circle_outlined,
              title: 'Account & sync',
              subtitle: 'Local-only or Supabase cloud sync.',
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const AccountSyncScreen(),
                  ),
                );
              },
            ),
            InputPlanTile(
              icon: Icons.translate_outlined,
              title: 'Language',
              subtitle: 'English, BM, Chinese, and Tamil preference.',
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const LanguageScreen(),
                  ),
                );
              },
            ),
            InputPlanTile(
              icon: Icons.privacy_tip_outlined,
              title: 'Privacy notice',
              subtitle: 'Local and optional cloud data handling.',
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const PrivacyNoticeScreen(),
                  ),
                );
              },
            ),
            InputPlanTile(
              icon: Icons.gavel_outlined,
              title: 'Disclaimer',
              subtitle: 'Calculator limitations and professional advice note.',
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const DisclaimerScreen(),
                  ),
                );
              },
            ),
            InputPlanTile(
              icon: Icons.assignment_outlined,
              title: 'Terms of use',
              subtitle: 'User responsibilities and acceptable app use.',
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const TermsOfUseScreen(),
                  ),
                );
              },
            ),
            InputPlanTile(
              icon: Icons.delete_forever_outlined,
              title: 'Data deletion instructions',
              subtitle: 'How to remove local app data in v1.',
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const DataDeletionInstructionsScreen(),
                  ),
                );
              },
            ),
            InputPlanTile(
              icon: Icons.folder_delete_outlined,
              title: 'Local data controls',
              subtitle: 'Review how saved scenarios are stored or delete them.',
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const LocalDataControlsScreen(),
                  ),
                );
              },
            ),
            const InputPlanTile(
              icon: Icons.system_update_alt_outlined,
              title: 'App version',
              subtitle:
                  'v${AppBuildInfo.releaseLabel}. PWA updates refresh automatically when a new build is available.',
            ),
            InputPlanTile(
              icon: Icons.fact_check_outlined,
              title: 'Assumptions and sources',
              subtitle: 'Formula basis, fee assumptions, and source notes.',
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => const AssumptionsSourcesScreen(),
                  ),
                );
              },
            ),
            const InputPlanTile(
              icon: Icons.block_outlined,
              title: 'Remove ads',
              subtitle: 'Google Play Billing purchase will be added later.',
            ),
            const InputPlanTile(
              icon: Icons.restore_outlined,
              title: 'Restore purchase',
              subtitle: 'Required for users who reinstall or change device.',
            ),
            const InputPlanTile(
              icon: Icons.update_outlined,
              title: 'Formula version',
              subtitle: 'Shows when Malaysia fee assumptions were reviewed.',
            ),
          ],
        ),
      ),
    );
  }
}

class PrivacyNoticeScreen extends StatelessWidget {
  const PrivacyNoticeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PolicyScreen(
      title: 'Privacy Notice',
      sections: [
        PolicySection(
          heading: 'Effective draft',
          body:
              'This draft is for Spectra Calculator by Spetrality Enterprise and reflects local-only use plus optional Supabase cloud sync before ads, billing, analytics, or broader account features are added.',
        ),
        PolicySection(
          heading: 'Current v1 data storage',
          body:
              'Saved scenarios, ongoing loan commitments, and the optional Personal Profile are stored locally on this device. The app does not upload this data to Spetrality Enterprise, banks, lawyers, valuers, PTPTN, LHDN, Google, or any cloud account in this version.',
        ),
        PolicySection(
          heading: 'Data users may enter',
          body:
              'Users may enter property price, vehicle price, loan balances, finance rates, saved scenario names, optional monthly income, salary, statutory deduction assumptions, living expenses, commitments, ongoing loan payments, and optional investment cashflow assumptions.',
        ),
        PolicySection(
          heading: 'Sensitive data',
          body:
              'Salary profile saving is optional. The app does not ask for NRIC, phone number, address, bank account details, card numbers, OTPs, or official loan documents.',
        ),
        PolicySection(
          heading: 'User control',
          body:
              'Users can delete individual saved scenarios from the Saved Scenarios screen, delete ongoing loans from Overall Loans, or delete all local data from Local Data Controls.',
        ),
        PolicySection(
          heading: 'Children and eligibility',
          body:
              'The app is intended for users who are old enough to make personal finance planning decisions. It is not designed for children or for collecting children personal data.',
        ),
        PolicySection(
          heading: 'Future ads, billing, accounts and analytics',
          body:
              'If ads, billing, analytics, additional login providers, or new cloud features are added later, this notice and the Play Store Data Safety form must be updated before those features collect or process data.',
        ),
        PolicySection(
          heading: 'Developer note',
          body:
              'This draft supports product planning and should be reviewed before Play Store release to match the final app behavior, privacy policy URL, and Malaysian PDPA obligations.',
        ),
      ],
    );
  }
}

class TermsOfUseScreen extends StatelessWidget {
  const TermsOfUseScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PolicyScreen(
      title: 'Terms of Use',
      sections: [
        PolicySection(
          heading: 'Use of the app',
          body:
              'Spectra Calculator is provided as a planning and education tool. By using the app, users agree to review assumptions carefully and use their own judgment before making financial, legal, tax, or property decisions.',
        ),
        PolicySection(
          heading: 'User responsibility',
          body:
              'Users are responsible for entering accurate values, checking official documents, and verifying results with banks, lawyers, valuers, PTPTN, LHDN, KWSP, PERKESO, or other relevant parties.',
        ),
        PolicySection(
          heading: 'No professional relationship',
          body:
              'Use of this app does not create a client, advisory, lending, legal, tax, valuation, agency, or fiduciary relationship with Spetrality Enterprise.',
        ),
        PolicySection(
          heading: 'Permitted use',
          body:
              'Users may use the app for personal planning, comparison, and education. Users must not misuse the app, reverse engineer it, interfere with app operation, or rely on it to misrepresent financial ability to any third party.',
        ),
        PolicySection(
          heading: 'Changes',
          body:
              'Features, assumptions, legal text, and calculator logic may be updated as Malaysia rules, product behavior, and app features evolve.',
        ),
      ],
    );
  }
}

class DisclaimerScreen extends StatelessWidget {
  const DisclaimerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PolicyScreen(
      title: 'Disclaimer',
      sections: [
        PolicySection(
          heading: 'Educational calculator only',
          body:
              'This app provides estimates for planning and education. It is not a bank, lender, law firm, valuation firm, tax adviser, financial adviser, or government agency.',
        ),
        PolicySection(
          heading: 'No approval guarantee',
          body:
              'Results do not guarantee loan approval, affordability, interest rate, legal fee, valuation fee, stamp duty exemption, tax treatment, or property transaction outcome.',
        ),
        PolicySection(
          heading: 'Not a loan provider',
          body:
              'The app does not offer, arrange, broker, underwrite, compare, sell, or approve loans. It does not collect applications, documents, collateral details, or personal identity documents for financing.',
        ),
        PolicySection(
          heading: 'Affordability guidance',
          body:
              'DSR and tenure suggestions are planning guides only. Banks may assess affordability using different income recognition, commitments, buffers, credit history, property type, and internal policy.',
        ),
        PolicySection(
          heading: 'Verify before decisions',
          body:
              'Users should verify figures with their bank, lawyer, valuer, developer, real estate agent, LHDN, and other relevant authorities before making financial or legal decisions.',
        ),
        PolicySection(
          heading: 'Assumptions may change',
          body:
              'Rules, fees, tax treatment, bank policies, and government exemptions may change. The app shows the last-reviewed date for formula assumptions where practical.',
        ),
        PolicySection(
          heading: 'User-entered data',
          body:
              'Users are responsible for checking the accuracy of values entered into the calculator and any manually edited professional fees.',
        ),
      ],
    );
  }
}

class DataDeletionInstructionsScreen extends StatelessWidget {
  const DataDeletionInstructionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PolicyScreen(
      title: 'Data Deletion',
      sections: [
        PolicySection(
          heading: 'Delete all local app data',
          body:
              'Open Settings, choose Local Data Controls, then tap Delete all local data. This removes saved scenarios, ongoing loans, and the optional Personal Profile from this device.',
        ),
        PolicySection(
          heading: 'Delete individual items',
          body:
              'Saved scenarios can be deleted from Saved Scenarios. Ongoing loans can be deleted from Overall Loans. Personal Profile can be replaced by saving new values or removed through Delete all local data.',
        ),
        PolicySection(
          heading: 'Uninstalling the app',
          body:
              'Uninstalling the app may also remove local data, depending on Android backup and device behavior.',
        ),
        PolicySection(
          heading: 'Future cloud accounts',
          body:
              'The current v1 app has no account login or cloud sync. If cloud sync is added later, account deletion and server-side deletion controls must be added before launch.',
        ),
      ],
    );
  }
}

class AssumptionsSourcesScreen extends StatelessWidget {
  const AssumptionsSourcesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Assumptions & Sources')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          children: [
            Text(
              'Rules reviewed 30 Jun 2026',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'These assumptions are used for estimates only and should be checked before launch or major rule changes.',
              style: theme.textTheme.bodyLarge?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 16),
            const SectionPanel(
              title: 'Installment formula',
              icon: Icons.calculate_outlined,
              children: [
                BulletText(
                  text:
                      'Monthly installment uses a standard reducing-balance amortization formula.',
                ),
                BulletText(
                  text:
                      'Islamic mode treats the entered rate as a profit-rate planning estimate. Actual Islamic home financing contracts, ibra treatment, sale price, and bank product structure may differ.',
                ),
                BulletText(
                  text:
                      'Total interest is estimated from scheduled monthly payments over the selected tenure.',
                ),
                BulletText(
                  text:
                      'Extra payment, lock-in period, refinancing, MRTA/MRTT, and bank package differences are not included yet.',
                ),
              ],
            ),
            const SizedBox(height: 12),
            const SectionPanel(
              title: 'Stamp duty',
              icon: Icons.receipt_long_outlined,
              children: [
                BulletText(
                  text:
                      'MOT transfer duty uses 1% on first RM100,000, 2% on next RM400,000, 3% on next RM500,000, and 4% above RM1,000,000.',
                ),
                BulletText(
                  text: 'Loan agreement stamp duty uses 0.5% of loan value.',
                ),
                BulletText(
                  text:
                      'First residential home mode estimates 100% exemption for eligible Malaysian citizens buying up to RM500,000 from 1 Jan 2026 to 31 Dec 2027.',
                ),
                BulletText(
                  text:
                      'Foreign residential buyer mode estimates 8% transfer duty from 1 Jan 2026.',
                ),
              ],
            ),
            const SizedBox(height: 12),
            const SectionPanel(
              title: 'Professional fees',
              icon: Icons.edit_note_outlined,
              children: [
                BulletText(
                  text:
                      'SPA and loan legal fee estimates use the Solicitors Remuneration Order 2023 scale.',
                ),
                BulletText(
                  text:
                      'New project/HDA mode applies the discounted legal fee scale.',
                ),
                BulletText(
                  text:
                      'Valuation fee estimate uses the LPEPH capital valuation scale with RM400 minimum.',
                ),
                BulletText(
                  text:
                      'SST/service tax and disbursement buffer are editable because actual invoices and provider treatment can vary.',
                ),
              ],
            ),
            const SizedBox(height: 12),
            const SectionPanel(
              title: 'Affordability guidance',
              icon: Icons.speed_outlined,
              children: [
                BulletText(
                  text:
                      'Current DSR is estimated as existing monthly commitments plus estimated installment, divided by monthly gross income.',
                ),
                BulletText(
                  text:
                      'Target DSR defaults to 40% and can be edited by the user. It is a planning target, not a fixed approval rule.',
                ),
                BulletText(
                  text:
                      'Tenure suggestions compare the same estimated loan amount and interest rate across 20, 25, 30, and 35 years.',
                ),
                BulletText(
                  text:
                      'Income and commitment fields are optional and are not saved into local scenarios in this version.',
                ),
              ],
            ),
            const SizedBox(height: 12),
            const SectionPanel(
              title: 'Salary planner',
              icon: Icons.person_pin_circle_outlined,
              children: [
                BulletText(
                  text:
                      'Salary planner estimates take-home pay from gross salary after editable EPF, SOCSO, EIS, and PCB/tax deduction assumptions.',
                ),
                BulletText(
                  text:
                      'EPF defaults to an 11% employee-rate planning estimate for Malaysian employees below 60, but official EPF contributions use KWSP schedules and rounding rules.',
                ),
                BulletText(
                  text:
                      'SOCSO and EIS default to editable percentage estimates with an editable wage ceiling. Official PERKESO contribution tables should be checked for payroll-grade accuracy.',
                ),
                BulletText(
                  text:
                      'Loan fit uses DSR and remaining-cashflow checks. It is not financial advice, tax advice, investment advice, or loan approval prediction.',
                ),
              ],
            ),
            const SizedBox(height: 12),
            const SectionPanel(
              title: 'Other loan calculators',
              icon: Icons.calculate_outlined,
              children: [
                BulletText(
                  text:
                      'Car loan mode uses a flat-rate hire purchase planning estimate and shows an effective reducing-balance equivalent for comparison.',
                ),
                BulletText(
                  text:
                      'Personal loan mode supports reducing-balance and flat-rate methods, plus an editable loan agreement stamp duty estimate.',
                ),
                BulletText(
                  text:
                      'Credit card mode compares the entered payment against a minimum-payment-only projection using editable minimum payment assumptions.',
                ),
                BulletText(
                  text:
                      'PTPTN mode defaults to a reducing-balance Ujrah planning estimate and keeps flat-rate mode available for simplified statement matching.',
                ),
              ],
            ),
            const SizedBox(height: 12),
            const SectionPanel(
              title: 'Source references',
              icon: Icons.source_outlined,
              children: [
                SourceText(
                  label: 'MOF Budget 2026 tax measures',
                  url:
                      'https://belanjawan.mof.gov.my/pdf/belanjawan2026/ucapan/tax-measures.pdf',
                ),
                SourceText(
                  label: 'LHDN stamp duty overview',
                  url: 'https://www.hasil.gov.my/en/stamp-duty/',
                ),
                SourceText(
                  label: 'LHDN Budget 2020 appendix',
                  url: 'https://phl.hasil.gov.my/pdf/pdfam/Budget_2020.pdf',
                ),
                SourceText(
                  label: 'LHDN loan agreement duty appendix',
                  url: 'https://phl.hasil.gov.my/pdf/pdfam/Appendix2012.pdf',
                ),
                SourceText(
                  label: 'Solicitors Remuneration Order 2023',
                  url:
                      'https://www.malaysianbar.org.my/cms/upload_files/document/Solicitors%20Remuneration%20Order%202023.pdf',
                ),
                SourceText(
                  label: 'LPEPH fees page',
                  url: 'https://lpeph.gov.my/fees',
                ),
                SourceText(
                  label: 'RMCD MySST tax policy',
                  url: 'https://mysst.customs.gov.my/TaxPolicy',
                ),
                SourceText(
                  label: 'BNM responsible financing practices',
                  url:
                      'https://www.bnm.gov.my/-/measures-to-promote-responsible-financing-practices',
                ),
                SourceText(
                  label: 'KWSP employer mandatory contribution',
                  url:
                      'https://www.kwsp.gov.my/en/employer/responsibilities/mandatory-contribution',
                ),
                SourceText(
                  label: 'PERKESO contribution rate',
                  url:
                      'https://www.perkeso.gov.my/en/rate-of-contribution.html',
                ),
                SourceText(
                  label: 'LHDN MyTax portal',
                  url: 'https://mytax.hasil.gov.my/',
                ),
                SourceText(
                  label: 'PTPTN official portal',
                  url: 'https://www.ptptn.gov.my/',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class BulletText extends StatelessWidget {
  const BulletText({super.key, required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.only(top: 8),
            child: SizedBox(
              width: 5,
              height: 5,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  color: Color(0xFF136F63),
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class SourceText extends StatelessWidget {
  const SourceText({super.key, required this.label, required this.url});

  final String label;
  final String url;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            url,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }
}

class PolicySection {
  const PolicySection({required this.heading, required this.body});

  final String heading;
  final String body;
}

class PolicyScreen extends StatelessWidget {
  const PolicyScreen({super.key, required this.title, required this.sections});

  final String title;
  final List<PolicySection> sections;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: SafeArea(
        child: ListView.separated(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          itemBuilder: (context, index) {
            final section = sections[index];
            return SectionPanel(
              title: section.heading,
              icon: Icons.article_outlined,
              children: [
                Text(
                  section.body,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            );
          },
          separatorBuilder: (_, _) => const SizedBox(height: 10),
          itemCount: sections.length,
        ),
      ),
    );
  }
}

class LocalDataControlsScreen extends StatefulWidget {
  const LocalDataControlsScreen({super.key});

  @override
  State<LocalDataControlsScreen> createState() =>
      _LocalDataControlsScreenState();
}

class _LocalDataControlsScreenState extends State<LocalDataControlsScreen> {
  final _homeRepository = SavedScenarioRepository();
  final _consumerRepository = ConsumerScenarioRepository();
  final _ongoingLoanRepository = OngoingLoanRepository();
  final _profileRepository = PersonalFinanceProfileRepository();
  late Future<({int scenarioCount, int ongoingLoanCount, bool hasProfile})>
  _localDataFuture;

  @override
  void initState() {
    super.initState();
    _localDataFuture = _loadLocalDataSummary();
  }

  Future<({int scenarioCount, int ongoingLoanCount, bool hasProfile})>
  _loadLocalDataSummary() async {
    final homeScenarios = await _homeRepository.loadAll();
    final consumerScenarios = await _consumerRepository.loadAll();
    final ongoingLoans = await _ongoingLoanRepository.loadAll();
    final profile = await _profileRepository.load();
    return (
      scenarioCount: homeScenarios.length + consumerScenarios.length,
      ongoingLoanCount: ongoingLoans.length,
      hasProfile: profile != null,
    );
  }

  void _reload() {
    setState(() {
      _localDataFuture = _loadLocalDataSummary();
    });
  }

  Future<void> _deleteAll() async {
    final shouldDelete = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete all local data?'),
        content: const Text(
          'This removes saved scenarios, ongoing loans, and the salary profile from this device. It cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton.icon(
            onPressed: () => Navigator.of(context).pop(true),
            icon: const Icon(Icons.delete_sweep_outlined),
            label: const Text('Delete all'),
          ),
        ],
      ),
    );

    if (shouldDelete != true) {
      return;
    }

    await _homeRepository.deleteAll();
    await _consumerRepository.deleteAll();
    await _ongoingLoanRepository.deleteAll();
    await _profileRepository.delete();
    if (!mounted) {
      return;
    }
    _reload();
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('All local data deleted.')));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Local Data Controls')),
      body: SafeArea(
        child:
            FutureBuilder<
              ({int scenarioCount, int ongoingLoanCount, bool hasProfile})
            >(
              future: _localDataFuture,
              builder: (context, snapshot) {
                final count = snapshot.data?.scenarioCount;
                final ongoingLoanCount = snapshot.data?.ongoingLoanCount;
                final hasProfile = snapshot.data?.hasProfile;

                return ListView(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                  children: [
                    Text(
                      'Saved on this device',
                      style: theme.textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      count == null
                          ? 'Checking local saved scenarios...'
                          : '$count saved scenario${count == 1 ? '' : 's'} found. ${ongoingLoanCount ?? 0} ongoing loan${ongoingLoanCount == 1 ? '' : 's'} found. Salary profile: ${hasProfile == true ? 'saved' : 'not saved'}.',
                      style: theme.textTheme.bodyLarge?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                    const SizedBox(height: 16),
                    const SectionPanel(
                      title: 'Local-only in v1',
                      icon: Icons.phonelink_lock_outlined,
                      children: [
                        Text(
                          'Saved scenarios and the optional salary profile stay on this device in the current version. Uninstalling the app may remove local saved data.',
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    FilledButton.icon(
                      onPressed:
                          count == null ||
                              (count == 0 &&
                                  (ongoingLoanCount ?? 0) == 0 &&
                                  hasProfile != true)
                          ? null
                          : _deleteAll,
                      icon: const Icon(Icons.delete_sweep_outlined),
                      label: const Text('Delete all local data'),
                    ),
                  ],
                );
              },
            ),
      ),
    );
  }
}

double _parseMoney(String value) {
  final cleaned = value
      .replaceAll(',', '')
      .replaceAll('RM', '')
      .replaceAll('rm', '')
      .trim();
  final parsed = double.tryParse(cleaned);

  if (parsed == null) {
    throw const FormatException('Enter a valid amount.');
  }

  return parsed;
}

double _parseOptionalMoney(String value) {
  if (value.trim().isEmpty) {
    return 0;
  }

  return _parseMoney(value);
}

double _parsePercent(String value) {
  final cleaned = value.replaceAll('%', '').trim();
  final parsed = double.tryParse(cleaned);

  if (parsed == null) {
    throw const FormatException('Enter a valid percentage.');
  }

  return parsed;
}

double _parseOptionalPercent(String value) {
  if (value.trim().isEmpty) {
    return 0;
  }

  return _parsePercent(value);
}

int _parseWholeNumber(String value) {
  final parsed = int.tryParse(value.trim());

  if (parsed == null) {
    throw const FormatException('Enter a valid whole number.');
  }

  return parsed;
}

String formatMyr(double value) {
  final rounded = roundToCents(value.abs());
  final parts = rounded.toStringAsFixed(2).split('.');
  final whole = parts.first;
  final cents = parts.last;
  final buffer = StringBuffer();

  for (var index = 0; index < whole.length; index += 1) {
    final remaining = whole.length - index;
    buffer.write(whole[index]);
    if (remaining > 1 && remaining % 3 == 1) {
      buffer.write(',');
    }
  }

  final sign = value < 0 ? '-' : '';
  return '${sign}RM ${buffer.toString()}.$cents';
}

String formatEditableAmount(double value) =>
    roundToCents(value).toStringAsFixed(2);

String formatEditablePercent(double value) {
  final rounded = roundToCents(value);
  if (rounded == rounded.roundToDouble()) {
    return rounded.toStringAsFixed(0);
  }

  return rounded.toStringAsFixed(2);
}

String formatPercent(double value) {
  final rounded = roundToCents(value);
  if (rounded == rounded.roundToDouble()) {
    return '${rounded.toStringAsFixed(0)}%';
  }

  return '${rounded.toStringAsFixed(2)}%';
}

String formatDate(DateTime date) {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return '${date.day} ${months[date.month - 1]} ${date.year}';
}

String formatMonthsDuration(int months) {
  if (months < 12) {
    return months == 1 ? '1 month' : '$months months';
  }

  final years = months ~/ 12;
  final remainingMonths = months % 12;
  final yearText = years == 1 ? '1 year' : '$years years';

  if (remainingMonths == 0) {
    return yearText;
  }

  final monthText = remainingMonths == 1
      ? '1 month'
      : '$remainingMonths months';
  return '$yearText $monthText';
}
