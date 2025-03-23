// import { Injectable } from '@nestjs/common';
// import { InjectDataSource } from '@nestjs/typeorm';
// import { DataSource } from 'typeorm';
// import { Items } from '../../orm/entities/items.entity';
// import { ItemCategories } from '../../orm/entities/intermediates/item.categories.entity';
// import { from, Observable, switchMap, throwError } from 'rxjs';

// @Injectable()
// export class ItemRegisterDatasource {
//   constructor(
//     @InjectDataSource()
//     private readonly dataSource: DataSource
//   ) {}

//   /**
//    * 新規の物品を1件登録する
//    * @param {ItemRegisterInputDto} input - リクエスト情報
//    * @return {Observable<ItemRegisterOutputDto>} - 登録した物品の情報
//    *
//    */

//   // registerItem(item: Items): Observable<Items> {
//   //   return from(
//   //     this.dataSource.transaction((manager) =>
//   //       manager.createQueryBuilder().insert().into(Items).values(item).execute()
//   //     )
//   //   ).pipe(
//   //     switchMap((result) => {
//   //       const id = result.identifiers[0]?.id;
//   //       return id
//   //         ? of({ ...item, id })
//   //         : throwError(() => new Error('登録に失敗しました'));
//   //     })
//   //   );
//   // }
//   registerItem(item: Items, categoryIds: number[]): Observable<Items> {
//     return from(
//       this.dataSource.transaction((manager) => {
//         // 1. Items を登録
//         return manager
//           .createQueryBuilder()
//           .insert()
//           .into(Items)
//           .values(item)
//           .execute()
//           .then((insertResult) => {
//             const itemId = insertResult.identifiers[0]?.id;
//             itemId
//               ? itemId
//               : (() => {
//                   throw new Error('登録に失敗しました');
//                 })();

//             // 2. 中間テーブルに登録
//             const itemCategories = categoryIds.map((categoryId) => ({
//               item: { id: itemId },
//               category: { id: categoryId },
//             }));

//             return manager
//               .createQueryBuilder()
//               .insert()
//               .into(ItemCategories)
//               .values(itemCategories)
//               .execute()
//               .then(() => ({ ...item, id: itemId }));
//           });
//       })
//     ).pipe(
//       switchMap((savedItem) =>
//         savedItem
//           ? from([savedItem])
//           : throwError(() => new Error('登録に失敗しました'))
//       )
//     );
//   }
// }
