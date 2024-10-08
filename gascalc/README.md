# ガス使用量計算ツール

## 概要

このツールは、入力された日付時刻と流量から、日ごとの酸素および窒素の使用量を計算します。

[ガス使用量計算ツール（デモ）](https://31103.github.io/ijitools/gascalc/gascalc.html)

## 使用方法

1. 「日付時刻」欄に、日付と時刻を `DDHHMM` の形式で入力します。
    - 例：2日9時7分の場合、`20907` と入力します。
    - 日付を省略することも可能です。その場合、直近で指定した日付を引き継ぎます。
    - 入力は時系列順ではなく、順不同でも可能です。
2. 「流量 (L/min)」欄に、流量を `L/min` 単位で入力します。
    - 例：酸素 1.5L/min の場合、`1.5` と入力します。
    - 人工呼吸器の場合は、分時換気量を入力します。
3. FiO2モードが有効になっている場合は、「FiO2 (%)」欄に、酸素濃度をパーセントで入力します。
    - 21 以上 100 以下の整数を入力してください。
4. 「追加」ボタンをクリックします。
5. 入力した内容がリストに追加され、酸素および窒素の使用量が計算されます。
6. 「クリア」ボタンをクリックすると、入力内容と計算結果がクリアされます。

## 設定

ツールバーの歯車アイコンをクリックすると、設定画面を開くことができます。

### FiO2モード

- FiO2モードを有効にすると、FiO2 を指定してガスの使用量を計算できます。
- ハイフローセラピーや人工呼吸器の算定に利用できます。

### 室内気不使用

- FiO2モードが有効な場合にのみ使用できます。
- 室内気 (Room Air) を使用せず、配管からの合成空気を使用する場合に、この設定を有効にします。
- 一部の人工呼吸器で使用します。

## 使用例

### 例：酸素吸入

1. 2日の8時30分であれば、日付時刻：`20830`と入力する。
2. 酸素流量2L/minであれば、流量：`2`と入力する。
3. 「追加」ボタンをクリックする。
4. 続けて必要な分の日付時刻と流量のペアを入力する。
5. 計算結果が表示される。

## 注意点

- 計算結果はあくまでも目安であり、実際の使用量とは異なります。
- このツールを使用した結果生じた損害等について、作者は一切の責任を負いません。
