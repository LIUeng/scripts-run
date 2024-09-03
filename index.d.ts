declare namespace ScriptsRun {
  type StorageItem = { k: string, v: string };
  type StoragePropsValue = StorageItem[];

  type StorageProps = { [k: string]: StoragePropsValue }

  type StorageValue = { [k: string]: string }

  type StorageOperate = 'add' | 'del' | 'delAll';
}