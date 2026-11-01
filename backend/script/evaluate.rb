require "json"
path = ENV.fetch("ANALYSIS_FILE")
actual = JSON.parse(File.read(path))
gold = JSON.parse(File.read(File.expand_path("../../evaluation/gold/sample_gold.json", __dir__)))

def scores(expected, predicted, key)
  e = expected[key].map { |x| x["id"] }.to_set
  p = predicted[key].map { |x| x["id"] }.to_set
  tp = (e & p).size
  precision = p.empty? ? 0.0 : tp.to_f / p.size
  recall = e.empty? ? 0.0 : tp.to_f / e.size
  f1 = precision + recall == 0 ? 0.0 : 2 * precision * recall / (precision + recall)
  { precision: precision.round(3), recall: recall.round(3), f1: f1.round(3), tp: tp, fp: (p-e).size, fn: (e-p).size }
end

require "set"
puts JSON.pretty_generate({
  decisions: scores(gold, actual, "key_decisions"),
  action_items: scores(gold, actual, "action_items"),
  note: "IDs must be assigned consistently by the human annotation/evaluation adapter. This fixture demonstrates the metric format."
})
