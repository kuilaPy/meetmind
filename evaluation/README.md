# Evaluation plan

Evaluate against human-labelled transcripts, not model self-confidence.

## Dimensions
1. Decision precision/recall/F1: false decisions are especially costly.
2. Action-item precision/recall/F1.
3. Owner exact-match accuracy, counting `null` as correct when no owner is stated.
4. Deadline exact-match accuracy, counting `null` as correct when no deadline is confirmed.
5. Evidence support: percentage of extracted decisions/actions whose evidence is an exact transcript substring.
6. Discussion-to-decision error rate.

## Procedure
- Two reviewers label each transcript independently, then resolve disagreements.
- Assign stable IDs to gold and predicted items using a review adapter.
- Run evaluation on a held-out set; do not tune prompts on the held-out transcripts.
- Report sample size and confidence intervals. Five examples are a smoke-test dataset, not statistically meaningful validation.

The included fixture is a metric-format example, not a claim of measured model quality.
