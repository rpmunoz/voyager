import {DEFAULT_QUERY_CONFIG} from 'compassql/build/src/config';
import {SpecQueryModel} from 'compassql/build/src/model';
import {SpecQuery} from 'compassql/build/src/query/spec';
import {Schema} from 'compassql/build/src/schema';
import {Channel} from 'vega-lite/build/src/channel';
import {Mark} from 'vega-lite/build/src/mark';
import {BOOKMARK_ADD_PLOT, BOOKMARK_MODIFY_NOTE, BOOKMARK_REMOVE_PLOT} from '../actions';
import {Bookmark, BookmarkItem} from '../models';
import {convertToPlotObjectsGroup, extractPlotObjects, PlotObject} from '../models/plot';
import {bookmarkReducer} from './bookmark';



describe('reducers/bookmark', () => {
  const schema = new Schema({fields: []});
  function buildSpecQueryModel(specQ: SpecQuery) {
    return SpecQueryModel.build(specQ, schema, DEFAULT_QUERY_CONFIG);
  }

  function buildSpecQueryModelGroup(specQs: SpecQuery[]) {
    const items = specQs.map(specQ => buildSpecQueryModel(specQ));
    return {
      name: 'a name',
      path: 'path',
      items: items,
    };
  }

  describe(BOOKMARK_ADD_PLOT, () => {
    it('should add a plot to the bookmark list', () => {
      const group = buildSpecQueryModelGroup([
        {
          mark: Mark.BAR,
          encodings: [
            {channel: Channel.X}
          ]
        }
      ]);

      const data = {url: 'a/data/set.csv'};
      const plotObjectGroup = convertToPlotObjectsGroup(group, data);
      const plotObject: PlotObject = extractPlotObjects(plotObjectGroup)[0];

      const specKey = JSON.stringify(plotObject.spec);
      const expectedBookmarkItem: BookmarkItem = {plot: plotObject, notes: ''};
      const expectedBookmarks = {};
      expectedBookmarks[specKey] = expectedBookmarkItem;

      expect(bookmarkReducer(
        {
          bookmarks: {},
          numBookmarks: 0,
        },
        {
          type: BOOKMARK_ADD_PLOT,
          payload: {
            plot: plotObject
          }
        }
      )).toEqual({
        bookmarks: expectedBookmarks,
        numBookmarks: 1,
      } as Bookmark);
    });

    it('should modify notes for a bookmarked plot', () => {
      const group = buildSpecQueryModelGroup([
        {
          mark: Mark.BAR,
          encodings: [
            {channel: Channel.X}
          ]
        }
      ]);

      const data = {url: 'a/data/set.csv'};
      const plotObjectGroup = convertToPlotObjectsGroup(group, data);
      const plotObject: PlotObject = extractPlotObjects(plotObjectGroup)[0];
      const bookmarkItem: BookmarkItem = {plot: plotObject, notes: ''};

      const specKey = JSON.stringify(plotObject.spec);
      const originalBookmarks = {};
      originalBookmarks[specKey] = bookmarkItem;

      const expectedBookmarkItem: BookmarkItem = {plot: plotObject, notes: 'This is very interesting.'};
      const expectedBookmarks = {};
      expectedBookmarks[specKey] = expectedBookmarkItem;

      expect(bookmarkReducer(
        {
          bookmarks: originalBookmarks,
          numBookmarks: 1,
        },
        {
          type: BOOKMARK_MODIFY_NOTE,
          payload: {
            notes: 'This is very interesting.',
            plot: plotObject
          }
        }
      )).toEqual({
        bookmarks: expectedBookmarks,
        numBookmarks: 1,
      } as Bookmark);
    });

    it('should remove a bookmark from the bookmark list', () => {
      const group = buildSpecQueryModelGroup([
        {
          mark: Mark.BAR,
          encodings: [
            {channel: Channel.X}
          ]
        }
      ]);

      const data = {url: 'a/data/set.csv'};
      const plotObjectGroup = convertToPlotObjectsGroup(group, data);
      const plotObject: PlotObject = extractPlotObjects(plotObjectGroup)[0];
      const bookmarkItem: BookmarkItem = {plot: plotObject, notes: ''};

      const specKey = JSON.stringify(plotObject.spec);
      const originalBookmarks = {};
      originalBookmarks[specKey] = bookmarkItem;

      expect(bookmarkReducer(
        {
          bookmarks: originalBookmarks,
          numBookmarks: 1,
        },
        {
          type: BOOKMARK_REMOVE_PLOT,
          payload: {
            plot: plotObject
          }
        }
      )).toEqual({
        bookmarks: {},
        numBookmarks: 0,
      } as Bookmark);
    });
  });
});