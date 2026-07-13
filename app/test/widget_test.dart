import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:loancalculator/main.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:shared_preferences_platform_interface/in_memory_shared_preferences_async.dart';
import 'package:shared_preferences_platform_interface/shared_preferences_async_platform_interface.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
    SharedPreferencesAsyncPlatform.instance =
        InMemorySharedPreferencesAsync.empty();
  });

  testWidgets('shows loan calculator hub and opens home loan screen', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const LoanCalculatorApp());

    expect(find.text('Spectra'), findsOneWidget);
    expect(find.text('Loan planner'), findsOneWidget);
    expect(find.text('Personal workspace'), findsOneWidget);
    expect(find.text('Create Personal Profile'), findsOneWidget);
    expect(find.text('Add Overall Loans'), findsOneWidget);
    await tester.scrollUntilVisible(
      find.text('Home Loan'),
      240,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('Home Loan'), findsOneWidget);

    await tester.tap(find.text('Home Loan'));
    await tester.pumpAndSettle();

    expect(find.text('Property financing'), findsOneWidget);
    expect(find.text('Property price'), findsOneWidget);
    await tester.scrollUntilVisible(
      find.text('Calculate'),
      240,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('Calculate'), findsOneWidget);
    expect(find.byIcon(Icons.calculate_outlined), findsOneWidget);
    await tester.scrollUntilVisible(
      find.text('Estimated monthly installment'),
      240,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('Estimated monthly installment'), findsOneWidget);
  });

  testWidgets('opens new beta calculator modules', (WidgetTester tester) async {
    await tester.pumpWidget(const LoanCalculatorApp());

    await tester.scrollUntilVisible(
      find.text('Car Loan'),
      240,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.tap(find.text('Car Loan'));
    await tester.pumpAndSettle();
    expect(find.text('Hire purchase estimate'), findsOneWidget);
    expect(find.text('Vehicle price'), findsOneWidget);

    await tester.tap(find.byType(BackButton));
    await tester.pumpAndSettle();

    await tester.scrollUntilVisible(
      find.text('Personal Loan'),
      240,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.tap(find.text('Personal Loan'));
    await tester.pumpAndSettle();
    expect(find.text('Repayment estimate'), findsOneWidget);
    expect(find.text('Loan amount'), findsOneWidget);

    await tester.tap(find.byType(BackButton));
    await tester.pumpAndSettle();

    await tester.scrollUntilVisible(
      find.text('Credit Card'),
      240,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.tap(find.text('Credit Card'));
    await tester.pumpAndSettle();
    expect(find.text('Payoff projection'), findsOneWidget);
    expect(find.text('Outstanding balance'), findsOneWidget);

    await tester.tap(find.byType(BackButton));
    await tester.pumpAndSettle();

    await tester.scrollUntilVisible(
      find.text('PTPTN Loan'),
      240,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.tap(find.text('PTPTN Loan'));
    await tester.pumpAndSettle();
    expect(find.text('Education repayment'), findsOneWidget);
    expect(find.text('Ujrah / service charge'), findsOneWidget);
  });

  testWidgets('opens profile and overall loans from drawer', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const LoanCalculatorApp());

    await tester.tap(find.byTooltip('Open navigation menu'));
    await tester.pumpAndSettle();
    await tester.tap(
      find.descendant(
        of: find.byType(Drawer),
        matching: find.text('Saved Profile'),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('Income and targets'), findsOneWidget);
    expect(find.text('Gross monthly salary'), findsOneWidget);

    await tester.tap(find.byType(BackButton));
    await tester.pumpAndSettle();

    await tester.tap(find.byTooltip('Open navigation menu'));
    await tester.pumpAndSettle();
    await tester.tap(
      find.descendant(
        of: find.byType(Drawer),
        matching: find.text('Overall Loans'),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('Monthly cashflow'), findsOneWidget);
    expect(find.text('Profile needed'), findsOneWidget);
  });

  testWidgets('opens assumptions and sources from settings', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const LoanCalculatorApp());

    await tester.tap(find.byTooltip('Open navigation menu'));
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(
      find.text('Settings'),
      120,
      scrollable: find.byType(Scrollable).last,
    );
    await tester.tap(find.text('Settings'));
    await tester.pumpAndSettle();

    await tester.scrollUntilVisible(
      find.text('Assumptions and sources'),
      240,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.drag(find.byType(Scrollable).first, const Offset(0, -120));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Assumptions and sources'));
    await tester.pumpAndSettle();

    expect(find.text('Rules reviewed 30 Jun 2026'), findsOneWidget);
    expect(find.text('Stamp duty'), findsOneWidget);
    await tester.scrollUntilVisible(
      find.text('Professional fees'),
      240,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('Professional fees'), findsOneWidget);
  });
}
