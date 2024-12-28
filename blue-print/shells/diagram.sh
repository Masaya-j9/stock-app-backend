#!/bin/bash

# 作成日時を取得
timestamp=$(date +"%Y%m%d%H%M%S")

# 出力ファイル名を生成
output_file="${timestamp}-relations.png"

# PlantUMLコマンドを実行して、ER図を生成
plantuml blue-print/er-diagrams/relations.pu

# 生成されたファイルをリネーム
mv blue-print/er-diagrams/relations.png assets/relations/$output_file

echo "Diagram generated: assets/relations/$output_file"