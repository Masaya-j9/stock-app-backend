#!/bin/bash

# 作成日時を取得
timestamp=$(date +"%Y%m%d%H%M%S")

# 出力ファイル名を生成
output_file="${timestamp}-domain-model.png"

# PlantUMLコマンドを実行して、ドメインモデル図を生成
plantuml -tpng -o . blue-print/domain-models/domain-model.pu

# 生成されたファイルをリネームして移動
mv blue-print/domain-models/domain-model.png assets/domain-models/$output_file

echo "Diagram generated: assets/domain-models/$output_file"