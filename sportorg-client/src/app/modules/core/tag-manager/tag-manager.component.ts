import {Component, Input, OnDestroy, OnInit, EventEmitter, Output} from "@angular/core";
import {LookupProxyService} from "../services/lookup-proxy.service";
import {MenuPositionX} from "@angular/material/menu";
import {LookupItem} from "../models/rest-objects";
import {Subscription} from "rxjs";
import {StaticValuesService} from "../services/static-values.service";
import {clone} from 'ramda';

@Component({
  selector: 'app-tag-manager',
  templateUrl: './tag-manager.component.html',
  styleUrls: ['./tag-manager.component.scss']
})
export class TagManagerComponent implements OnInit, OnDestroy {
  constructor(protected lookupService: LookupProxyService) {
  }

  @Input() title = 'Tags';
  @Input() disabled = false;
  @Input() position: MenuPositionX = 'before';

  @Input() get selectedTags() {
    return this._selectedTags;
  } set selectedTags (newTags: number[]) {
    if (newTags) {
      this._selectedTags = newTags;
      this.applyTags(clone(this.availableTags));
    }
  }
  protected _selectedTags: number[] = [];
  @Output() selectedTagsValue = new EventEmitter<number[]>();

  protected tagsSub: Subscription;
  public selectedTagsString = '';
  public availableTags: LookupItem[] = [
    {id:1, name: 'News', lookup: 'tags'},
    {id:2, name: 'Club', lookup: 'tags'},
    {id:3, name: 'Tournament', lookup: 'tags'},
    {id:4, name: 'Cadet', lookup: 'tags'},
  ];

  public isAddingTag = false;
  public newTagName = '';
  public editTagName = () => {
    this.newTagName = '';
    this.isAddingTag = true;
  }
  public saveTagName = () => {
    // send request to save tag
    this.lookupService.addTag(this.newTagName).subscribe((completed: boolean) => {
      if (completed) {
        this.getTags(true);
        this.newTagName = '';
        this.isAddingTag = false;
      }
    });
  }

  protected getSelectedNames = () => {
    const selectedItems = this.availableTags.filter(t => this.selectedTags.includes(t.id));
    let tagNames: string[] = selectedItems.map(t => t.name);
    return tagNames.join(', ');
  }
  public toggleTag = (checked: boolean, tag: LookupItem) => {
    const foundTag = this.selectedTags.find(t => t === tag.id);
    if (checked) { // add unique to selected
      if (!foundTag) { // change detected
        this._selectedTags.push(tag.id);
        this.selectedTagsString = this.getSelectedNames();
        this.selectedTagsValue.emit(this._selectedTags);
      }
    } else { // remove tag
      const foundTag = this.selectedTags.find(t => t === tag.id);
      if (foundTag) { // change detected
        this._selectedTags = this._selectedTags.filter(t => t !== tag.id);
        this.selectedTagsString = this.getSelectedNames();
        this.selectedTagsValue.emit(this._selectedTags);
      }
    }
  }
  protected getTags = (refresh: boolean = false) => {
    this.tagsSub = this.lookupService.getTags(refresh).subscribe((tags: LookupItem[]) => {
      this.applyTags(tags);
    })
  }
  protected applyTags = (tags: LookupItem[]) => { // both are required to finish setting up the UI but arrive at different times
    if (tags?.length && this.selectedTags?.length) {
      tags.map((tag: LookupItem) => {
        tag.checked = this.selectedTags.includes(tag.id);
      });
    }
    this.availableTags = tags;
    setTimeout(() => this.selectedTagsString = this.getSelectedNames());
  }

  ngOnInit(): void {
    this.getTags();
  }
  ngOnDestroy(): void {
    StaticValuesService.cleanSubs([this.tagsSub]);
  }
}
