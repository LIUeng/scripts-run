declare namespace ScriptsRun {
  type StoragePropsValue = Array<{ k: string, v: string }>;

  type StorageProps = { [k: string]: StoragePropsValue }
}